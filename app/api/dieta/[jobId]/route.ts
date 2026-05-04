import { NextResponse } from "next/server";
import { obterJobDieta } from "@/lib/fila-dieta";
import {
  ErroSegurancaDieta,
  validarOriginDaRequisicao,
} from "@/lib/seguranca-dieta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ContextoRoute {
  params: Promise<{
    jobId: string;
  }>;
}

export async function GET(_request: Request, context: ContextoRoute) {
  try {
    validarOriginDaRequisicao(_request);
    const { jobId } = await context.params;
    const job = obterJobDieta(jobId);

    if (!job) {
      return NextResponse.json(
        { erro: "Solicitação de dieta não encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      objetivo: job.objetivo,
      calorias: job.calorias,
      dieta: job.dieta,
      erro: job.erro,
      tentativas: job.tentativas,
      posicaoNaFila: job.posicaoNaFila,
      tempoEstimadoSegundos: job.tempoEstimadoSegundos,
      criadoEm: job.criadoEm,
      atualizadoEm: job.atualizadoEm,
      finalizadoEm: job.finalizadoEm,
    });
  } catch (error) {
    if (error instanceof ErroSegurancaDieta) {
      return NextResponse.json({ erro: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { erro: "Não foi possível consultar a solicitação de dieta." },
      { status: 400 },
    );
  }
}
