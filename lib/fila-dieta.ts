import { gerarDietaComGemini, ErroLimiteGemini } from "@/lib/dieta-ia";
import type { ObjetivoDieta } from "@/lib/dieta";

export type StatusFilaDieta =
  | "pendente"
  | "processando"
  | "concluido"
  | "erro";

export interface JobDieta {
  id: string;
  ip: string;
  calorias: number;
  objetivo: ObjetivoDieta;
  status: StatusFilaDieta;
  dieta: string | null;
  erro: string | null;
  tentativas: number;
  criadoEm: string;
  atualizadoEm: string;
  finalizadoEm: string | null;
}

export interface JobDietaPublico extends JobDieta {
  posicaoNaFila: number | null;
  tempoEstimadoSegundos: number | null;
}

interface EstadoFilaDieta {
  jobs: Map<string, JobDieta>;
  fila: string[];
  processando: boolean;
  ultimaExecucaoEm: number;
  bloqueadoAte: number;
  ultimaLimpezaEm: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __filaDietaState: EstadoFilaDieta | undefined;
}

const INTERVALO_MINIMO_MS = Number(process.env.DIETA_MIN_INTERVAL_MS ?? 6000);
const MAX_TENTATIVAS = Number(process.env.DIETA_MAX_TENTATIVAS ?? 3);
const BACKOFF_LIMITE_MS = Number(process.env.DIETA_RATE_LIMIT_BACKOFF_MS ?? 15000);
const JOB_TTL_MS = Number(process.env.DIETA_JOB_TTL_MS ?? 30 * 60 * 1000);
const LIMPEZA_MINIMA_INTERVALO_MS = Number(
  process.env.DIETA_JOB_CLEANUP_INTERVAL_MS ?? 60 * 1000,
);
const MAX_JOBS_PENDENTES_POR_IP = Number(
  process.env.DIETA_MAX_PENDING_JOBS_PER_IP ?? 2,
);

function agoraIso() {
  return new Date().toISOString();
}

function criarEstadoFila(): EstadoFilaDieta {
  if (!globalThis.__filaDietaState) {
    globalThis.__filaDietaState = {
      jobs: new Map<string, JobDieta>(),
      fila: [],
      processando: false,
      ultimaExecucaoEm: 0,
      bloqueadoAte: 0,
      ultimaLimpezaEm: 0,
    };
  }

  return globalThis.__filaDietaState;
}

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calcularPosicaoNaFila(estado: EstadoFilaDieta, jobId: string) {
  const indice = estado.fila.indexOf(jobId);
  return indice === -1 ? null : indice + 1;
}

function calcularTempoEstimadoSegundos(posicaoNaFila: number | null) {
  if (posicaoNaFila === null) {
    return null;
  }

  return Math.max(posicaoNaFila - 1, 0) * Math.ceil(INTERVALO_MINIMO_MS / 1000);
}

function serializarJob(
  estado: EstadoFilaDieta,
  job: JobDieta,
): JobDietaPublico {
  const posicaoNaFila =
    job.status === "pendente" ? calcularPosicaoNaFila(estado, job.id) : null;

  return {
    ...job,
    posicaoNaFila,
    tempoEstimadoSegundos: calcularTempoEstimadoSegundos(posicaoNaFila),
  };
}

function jobExpirado(job: JobDieta, agora: number) {
  const referencia = job.finalizadoEm
    ? new Date(job.finalizadoEm).getTime()
    : new Date(job.atualizadoEm).getTime();

  return agora - referencia > JOB_TTL_MS;
}

function limparJobsExpirados(estado: EstadoFilaDieta) {
  const agora = Date.now();

  if (agora - estado.ultimaLimpezaEm < LIMPEZA_MINIMA_INTERVALO_MS) {
    return;
  }

  estado.ultimaLimpezaEm = agora;
  estado.fila = estado.fila.filter((jobId) => estado.jobs.has(jobId));

  for (const [jobId, job] of estado.jobs.entries()) {
    const finalizado = job.status === "concluido" || job.status === "erro";

    if (finalizado && jobExpirado(job, agora)) {
      estado.jobs.delete(jobId);
    }
  }
}

async function processarFila() {
  const estado = criarEstadoFila();
  limparJobsExpirados(estado);

  if (estado.processando) {
    return;
  }

  estado.processando = true;

  try {
    while (estado.fila.length > 0) {
      const agora = Date.now();
      const proximaJanela = Math.max(
        estado.ultimaExecucaoEm + INTERVALO_MINIMO_MS,
        estado.bloqueadoAte,
      );

      if (agora < proximaJanela) {
        await esperar(proximaJanela - agora);
      }

      const jobId = estado.fila.shift();

      if (!jobId) {
        continue;
      }

      const job = estado.jobs.get(jobId);

      if (!job || job.status === "concluido") {
        continue;
      }

      job.status = "processando";
      job.erro = null;
      job.tentativas += 1;
      job.atualizadoEm = agoraIso();

      try {
        const dieta = await gerarDietaComGemini({
          calorias: job.calorias,
          objetivo: job.objetivo,
        });

        job.status = "concluido";
        job.dieta = dieta;
        job.erro = null;
        job.finalizadoEm = agoraIso();
        job.atualizadoEm = job.finalizadoEm;
        estado.ultimaExecucaoEm = Date.now();
      } catch (error) {
        estado.ultimaExecucaoEm = Date.now();

        if (
          error instanceof ErroLimiteGemini &&
          job.tentativas < MAX_TENTATIVAS
        ) {
          job.status = "pendente";
          job.erro =
            "Fila congestionada temporariamente. Estamos tentando novamente.";
          job.atualizadoEm = agoraIso();
          estado.bloqueadoAte = Date.now() + BACKOFF_LIMITE_MS;
          estado.fila.push(job.id);
          continue;
        }

        job.status = "erro";
        job.dieta = null;
        job.erro =
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao gerar a dieta.";
        job.finalizadoEm = agoraIso();
        job.atualizadoEm = job.finalizadoEm;
      }
    }
  } finally {
    estado.processando = false;
  }
}

export function criarJobDieta({
  ip,
  calorias,
  objetivo,
}: {
  ip: string;
  calorias: number;
  objetivo: ObjetivoDieta;
}) {
  const estado = criarEstadoFila();
  limparJobsExpirados(estado);
  const id = crypto.randomUUID();
  const job: JobDieta = {
    id,
    ip,
    calorias,
    objetivo,
    status: "pendente",
    dieta: null,
    erro: null,
    tentativas: 0,
    criadoEm: agoraIso(),
    atualizadoEm: agoraIso(),
    finalizadoEm: null,
  };

  estado.jobs.set(id, job);
  estado.fila.push(id);
  void processarFila();

  return serializarJob(estado, job);
}

export function obterJobDieta(id: string) {
  const estado = criarEstadoFila();
  limparJobsExpirados(estado);
  const job = estado.jobs.get(id);

  if (!job) {
    return null;
  }

  return serializarJob(estado, job);
}

export function obterQuantidadeJobsAtivosPorIp(ip: string) {
  const estado = criarEstadoFila();
  limparJobsExpirados(estado);

  let total = 0;

  for (const job of estado.jobs.values()) {
    if (
      job.ip === ip &&
      (job.status === "pendente" || job.status === "processando")
    ) {
      total += 1;
    }
  }

  return total;
}

export function obterMaximoJobsPendentesPorIp() {
  return MAX_JOBS_PENDENTES_POR_IP;
}
