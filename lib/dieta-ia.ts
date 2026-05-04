import { construirPromptDieta } from "@/lib/dieta";
import type { ObjetivoDieta } from "@/lib/dieta";

interface RespostaGemini {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
  error?: {
    message?: string;
  };
}

const URL_BASE_GEMINI = "https://generativelanguage.googleapis.com/v1beta";
const MODELO_GEMINI_PADRAO = "gemini-2.5-flash";

export class ErroLimiteGemini extends Error {
  readonly retryable = true;

  constructor(message: string) {
    super(message);
    this.name = "ErroLimiteGemini";
  }
}

function extrairTextoDaResposta(resposta: RespostaGemini) {
  const texto = (resposta.candidates ?? [])
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text?.trim())
    .filter((part): part is string => Boolean(part))
    .join("\n")
    .trim();

  if (texto) {
    return texto;
  }

  if (resposta.promptFeedback?.blockReason) {
    throw new Error(
      `A resposta da IA foi bloqueada: ${resposta.promptFeedback.blockReason}.`,
    );
  }

  if (resposta.error?.message) {
    throw new Error(resposta.error.message);
  }

  throw new Error("A IA não retornou uma dieta em texto.");
}

export async function gerarDietaComGemini({
  calorias,
  objetivo,
}: {
  calorias: number;
  objetivo: ObjetivoDieta;
}) {
  const chaveGemini = process.env.GEMINI_API_KEY;

  if (!chaveGemini) {
    throw new Error(
      "A chave da API do Gemini não está configurada no servidor. Defina GEMINI_API_KEY para habilitar a geração de dieta.",
    );
  }

  const modelo = process.env.GEMINI_MODEL || MODELO_GEMINI_PADRAO;
  const prompt = construirPromptDieta({ calorias, objetivo });

  const resposta = await fetch(
    `${URL_BASE_GEMINI}/models/${modelo}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": chaveGemini,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
      cache: "no-store",
    },
  );

  const dados = (await resposta.json()) as RespostaGemini;

  if (resposta.status === 429) {
    throw new ErroLimiteGemini(
      dados.error?.message ||
        "O limite temporário do Gemini foi atingido. A solicitação será tentada novamente em instantes.",
    );
  }

  if (!resposta.ok) {
    throw new Error(
      dados.error?.message ||
        "Não foi possível gerar a dieta com a API do Gemini.",
    );
  }

  return extrairTextoDaResposta(dados);
}
