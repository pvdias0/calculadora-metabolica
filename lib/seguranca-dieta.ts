interface ResultadoRateLimit {
  permitido: boolean;
  restante: number;
  resetEmMs: number;
}

interface EstadoSegurancaDieta {
  requisicoesPorIp: Map<string, number[]>;
}

declare global {
  // eslint-disable-next-line no-var
  var __segurancaDietaState: EstadoSegurancaDieta | undefined;
}

const JANELA_RATE_LIMIT_MS = Number(
  process.env.DIETA_RATE_LIMIT_WINDOW_MS ?? 60_000,
);
const MAX_REQUISICOES_POR_JANELA = Number(
  process.env.DIETA_RATE_LIMIT_MAX_REQUESTS ?? 4,
);

function obterEstadoSeguranca() {
  if (!globalThis.__segurancaDietaState) {
    globalThis.__segurancaDietaState = {
      requisicoesPorIp: new Map<string, number[]>(),
    };
  }

  return globalThis.__segurancaDietaState;
}

export class ErroSegurancaDieta extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ErroSegurancaDieta";
    this.status = status;
  }
}

export function obterIpDaRequisicao(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "ip-desconhecido";
  }

  if (realIp) {
    return realIp.trim();
  }

  return "ip-desconhecido";
}

function obterOriginsPermitidas(request: Request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const configuradas = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!host) {
    return configuradas;
  }

  return Array.from(new Set([...configuradas, `${proto}://${host}`]));
}

function extrairOriginValida(cabecalho: string | null) {
  if (!cabecalho) {
    return null;
  }

  try {
    return new URL(cabecalho).origin;
  } catch {
    return null;
  }
}

export function validarOriginDaRequisicao(request: Request) {
  const origin =
    request.headers.get("origin") ??
    extrairOriginValida(request.headers.get("referer"));
  const permitidas = obterOriginsPermitidas(request);

  if (!origin) {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    throw new ErroSegurancaDieta(
      "Origem da requisição ausente. Requisição bloqueada por segurança.",
      403,
    );
  }

  if (!permitidas.includes(origin)) {
    throw new ErroSegurancaDieta(
      "Origem da requisição não autorizada para este endpoint.",
      403,
    );
  }
}

export function aplicarRateLimitPorIp(ip: string): ResultadoRateLimit {
  const estado = obterEstadoSeguranca();
  const agora = Date.now();
  const inicioJanela = agora - JANELA_RATE_LIMIT_MS;
  const timestamps = (estado.requisicoesPorIp.get(ip) ?? []).filter(
    (timestamp) => timestamp >= inicioJanela,
  );

  if (timestamps.length >= MAX_REQUISICOES_POR_JANELA) {
    const resetEmMs = Math.max(
      timestamps[0]! + JANELA_RATE_LIMIT_MS - agora,
      1_000,
    );

    estado.requisicoesPorIp.set(ip, timestamps);

    return {
      permitido: false,
      restante: 0,
      resetEmMs,
    };
  }

  timestamps.push(agora);
  estado.requisicoesPorIp.set(ip, timestamps);

  return {
    permitido: true,
    restante: Math.max(MAX_REQUISICOES_POR_JANELA - timestamps.length, 0),
    resetEmMs: JANELA_RATE_LIMIT_MS,
  };
}

export function limparEstadoRateLimit() {
  const estado = obterEstadoSeguranca();
  const limite = Date.now() - JANELA_RATE_LIMIT_MS;

  for (const [ip, timestamps] of estado.requisicoesPorIp.entries()) {
    const ativos = timestamps.filter((timestamp) => timestamp >= limite);

    if (ativos.length === 0) {
      estado.requisicoesPorIp.delete(ip);
      continue;
    }

    estado.requisicoesPorIp.set(ip, ativos);
  }
}

