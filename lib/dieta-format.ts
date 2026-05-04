export interface SecaoDietaFormatada {
  titulo: string;
  descricao: string | null;
  calorias: string | null;
  itens: string[];
}

const palavrasMinusculas = new Set(["da", "de", "do", "das", "dos", "e"]);
const titulosRefeicao = [
  "cafe da manha",
  "café da manhã",
  "lanche da manhã",
  "lanche da tarde",
  "almoco",
  "almoço",
  "jantar",
  "ceia",
  "pre-treino",
  "pré-treino",
  "pos-treino",
  "pós-treino",
  "colacao",
  "colação",
  "refeicao \\d+",
  "refeição \\d+",
];

const regexTituloRefeicao = new RegExp(
  `^(${titulosRefeicao.join("|")})(?:\\s*[:\\-–—]?\\s*(.*))?$`,
  "i",
);

function limparTextoBase(texto: string) {
  return texto
    .trim()
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/[•]/g, "-")
    .replace(/[–—]/g, "-")
    .replace(/^[>*\-\s]+/, "")
    .replace(/^\d+[.)-]\s*/, "")
    .trim();
}

function formatarTituloDieta(titulo: string) {
  return limparTextoBase(titulo)
    .replace(/[:\-–—]+$/, "")
    .toLocaleLowerCase("pt-BR")
    .split(/\s+/)
    .map((palavra, indice) => {
      if (indice > 0 && palavrasMinusculas.has(palavra)) {
        return palavra;
      }

      return (
        palavra.charAt(0).toLocaleUpperCase("pt-BR") +
        palavra.slice(1).toLocaleLowerCase("pt-BR")
      );
    })
    .join(" ");
}

export function separarItemECalorias(item: string) {
  const itemNormalizado = limparTextoBase(item);
  const correspondencias = [
    ...itemNormalizado.matchAll(/(\d+(?:[.,]\d+)?)\s*kcal\b/gi),
  ];
  const calorias = correspondencias.at(-1)?.[0] ?? null;

  if (!calorias) {
    return { descricao: itemNormalizado, calorias: null };
  }

  const descricao = itemNormalizado
    .replace(/\s*(?:=>|=|:|-)?\s*\d+(?:[.,]\d+)?\s*kcal\b\s*$/i, "")
    .trim();

  return {
    descricao: descricao || itemNormalizado,
    calorias,
  };
}

function extrairResumoDaSecao(resto: string) {
  const restoLimpo = limparTextoBase(resto).replace(/^\((.*)\)$/, "$1").trim();

  if (!restoLimpo) {
    return { descricao: null, calorias: null, itemInicial: null };
  }

  const { descricao, calorias } = separarItemECalorias(restoLimpo);

  if (
    /^\(?\s*(?:aproximadamente\s*)?\d+(?:[.,]\d+)?\s*kcal\)?$/i.test(restoLimpo)
  ) {
    return { descricao: null, calorias, itemInicial: null };
  }

  if (
    /^\(.*\)$/.test(resto.trim()) ||
    /aproximadamente/i.test(restoLimpo) ||
    /^meta\b/i.test(restoLimpo)
  ) {
    return {
      descricao: descricao || restoLimpo,
      calorias,
      itemInicial: null,
    };
  }

  return {
    descricao: null,
    calorias: null,
    itemInicial: restoLimpo,
  };
}

export function dividirConteudoDieta(
  conteudo: string,
): SecaoDietaFormatada[] {
  const linhas = conteudo
    .split("\n")
    .map(limparTextoBase)
    .filter(Boolean);

  const secoes: SecaoDietaFormatada[] = [];
  let secaoAtual: SecaoDietaFormatada | null = null;

  for (const linha of linhas) {
    const correspondenciaTitulo = linha.match(regexTituloRefeicao);

    if (correspondenciaTitulo) {
      const resto = correspondenciaTitulo[2]?.trim() ?? "";
      const resumo = extrairResumoDaSecao(resto);

      secaoAtual = {
        titulo: formatarTituloDieta(correspondenciaTitulo[1]),
        descricao: resumo.descricao,
        calorias: resumo.calorias,
        itens: resumo.itemInicial ? [resumo.itemInicial] : [],
      };
      secoes.push(secaoAtual);
      continue;
    }

    const linhaComTituloEItem = linha.match(/^(.+?)\s*[:\-–—]\s*(.+)$/);

    if (
      linhaComTituloEItem &&
      regexTituloRefeicao.test(linhaComTituloEItem[1].trim())
    ) {
      secaoAtual = {
        titulo: formatarTituloDieta(linhaComTituloEItem[1]),
        descricao: null,
        calorias: null,
        itens: [linhaComTituloEItem[2].trim()],
      };
      secoes.push(secaoAtual);
      continue;
    }

    if (!secaoAtual) {
      secaoAtual = {
        titulo: "Plano sugerido",
        descricao: null,
        calorias: null,
        itens: [],
      };
      secoes.push(secaoAtual);
    }

    secaoAtual.itens.push(linha);
  }

  return secoes.filter(
    (secao) =>
      secao.itens.length > 0 || secao.descricao !== null || secao.calorias !== null,
  );
}
