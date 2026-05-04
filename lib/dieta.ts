export type ObjetivoDieta = "emagrecimento" | "manutencao" | "hipertrofia";

export interface ConfiguracaoObjetivoDieta {
  id: ObjetivoDieta;
  titulo: string;
  objetivoPrompt: string;
  descricaoObjetivo: string;
  descricaoCard: string;
}

export const configuracoesObjetivoDieta: Record<
  ObjetivoDieta,
  ConfiguracaoObjetivoDieta
> = {
  emagrecimento: {
    id: "emagrecimento",
    titulo: "Perder Peso",
    objetivoPrompt: "Emagrecimento",
    descricaoObjetivo: "Redução de gordura corporal de maneira saudável",
    descricaoCard: "Déficit de 400 kcal/dia ≈ 0.5 kg/semana",
  },
  manutencao: {
    id: "manutencao",
    titulo: "Manter Peso",
    objetivoPrompt: "Manutenção do peso",
    descricaoObjetivo: "Equilíbrio calórico para manter o físico atual",
    descricaoCard: "Consumir suas calorias de manutenção",
  },
  hipertrofia: {
    id: "hipertrofia",
    titulo: "Ganhar Peso",
    objetivoPrompt: "Ganho de massa muscular",
    descricaoObjetivo: "Aumento calórico com foco em hipertrofia",
    descricaoCard: "Superávit de 400 kcal/dia ≈ 0.5 kg/semana",
  },
};

export const objetivosDieta = Object.values(configuracoesObjetivoDieta);

export function ehObjetivoDieta(valor: string): valor is ObjetivoDieta {
  return valor in configuracoesObjetivoDieta;
}

export function obterObjetivoDieta(
  objetivo: ObjetivoDieta,
): ConfiguracaoObjetivoDieta {
  return configuracoesObjetivoDieta[objetivo];
}

export function construirPromptDieta({
  calorias,
  objetivo,
}: {
  calorias: number;
  objetivo: ObjetivoDieta;
}) {
  const configuracao = obterObjetivoDieta(objetivo);

  return [
    "Responda em português do Brasil.",
    `Qual uma dieta aproximada para alcançar ${calorias} kcal/dia, com objetivo de ${configuracao.objetivoPrompt} (${configuracao.descricaoObjetivo})?`,
    "Me retorne a resposta apenas com a dieta, não escreva uma introdução ou fechamento na resposta, apenas a dieta direta e reta, mostrando a quantidade aproximada de calorias de cada alimento sugerido (exemplo: 1 copo de suco => 300 kcal).",
    "Organize a resposta por refeições.",
  ].join(" ");
}
