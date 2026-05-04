import { NextResponse } from "next/server";
import {
  criarJobDieta,
  obterMaximoJobsPendentesPorIp,
  obterQuantidadeJobsAtivosPorIp,
} from "@/lib/fila-dieta";
import { ehObjetivoDieta } from "@/lib/dieta";
import {
  aplicarRateLimitPorIp,
  captchaObrigatorio,
  ErroSegurancaDieta,
  limparEstadoRateLimit,
  obterIpDaRequisicao,
  validarCaptchaTurnstile,
  validarOriginDaRequisicao,
} from "@/lib/seguranca-dieta";
import type { ObjetivoDieta } from "@/lib/dieta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequisicaoDieta {
  calorias?: number;
  objetivo?: string;
  captchaToken?: string;
}

function validarCorpo(corpo: RequisicaoDieta): {
  calorias: number;
  objetivo: ObjetivoDieta;
} {
  const calorias =
    typeof corpo.calorias === "number"
      ? corpo.calorias
      : Number(corpo.calorias);
  const objetivo = corpo.objetivo;

  if (!Number.isFinite(calorias) || calorias <= 0) {
    throw new Error("Informe uma quantidade válida de calorias.");
  }

  if (!objetivo || !ehObjetivoDieta(objetivo)) {
    throw new Error("Informe um objetivo de dieta válido.");
  }

  return {
    calorias: Math.round(calorias),
    objetivo,
  };
}

export async function POST(request: Request) {
  try {
    limparEstadoRateLimit();
    validarOriginDaRequisicao(request);

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          erro:
            "A chave da API do Gemini não está configurada no servidor. Defina GEMINI_API_KEY para habilitar a geração de dieta.",
        },
        { status: 500 },
      );
    }

    const corpo = (await request.json()) as RequisicaoDieta;
    const ip = obterIpDaRequisicao(request);
    const rateLimit = aplicarRateLimitPorIp(ip);

    if (!rateLimit.permitido) {
      return NextResponse.json(
        {
          erro:
            "Muitas solicitações em sequência para gerar dieta. Aguarde um pouco e tente novamente.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateLimit.resetEmMs / 1000)),
          },
        },
      );
    }

    const jobsAtivos = obterQuantidadeJobsAtivosPorIp(ip);
    const maximoJobsAtivos = obterMaximoJobsPendentesPorIp();

    if (jobsAtivos >= maximoJobsAtivos) {
      return NextResponse.json(
        {
          erro:
            "Você já possui solicitações de dieta em andamento. Aguarde a fila avançar antes de criar outra.",
        },
        { status: 429 },
      );
    }

    await validarCaptchaTurnstile({
      token: corpo.captchaToken,
      ip,
    });

    const { calorias, objetivo } = validarCorpo(corpo);
    const job = criarJobDieta({ ip, calorias, objetivo });

    return NextResponse.json(
      {
        jobId: job.id,
        status: job.status,
        objetivo: job.objetivo,
        calorias: job.calorias,
        posicaoNaFila: job.posicaoNaFila,
        tempoEstimadoSegundos: job.tempoEstimadoSegundos,
        captchaObrigatorio: captchaObrigatorio(),
      },
      { status: 202 },
    );
  } catch (error) {
    if (error instanceof ErroSegurancaDieta) {
      return NextResponse.json({ erro: error.message }, { status: error.status });
    }

    const mensagemErro =
      error instanceof Error
        ? error.message
        : "Ocorreu um erro ao criar a solicitação de dieta.";

    return NextResponse.json({ erro: mensagemErro }, { status: 400 });
  }
}
