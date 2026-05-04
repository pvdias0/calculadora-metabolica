import {
  PDFDocument,
  StandardFonts,
  rgb,
  type Color,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

import {
  separarItemECalorias,
  type SecaoDietaFormatada,
} from "@/lib/dieta-format";

interface DietaPdfPayload {
  tituloObjetivo: string;
  descricaoObjetivo: string;
  calorias: number;
  secoes: SecaoDietaFormatada[];
  observacao: string;
  nomeArquivo?: string;
}

const PAGE = {
  width: 595.28,
  height: 841.89,
  marginX: 42,
  marginTop: 44,
  marginBottom: 42,
};

const COLORS = {
  ink: rgb(0.1, 0.13, 0.2),
  muted: rgb(0.41, 0.45, 0.55),
  accent: rgb(0.4, 0.3, 0.93),
  accentSoft: rgb(0.92, 0.9, 1),
  accentSurface: rgb(0.96, 0.96, 1),
  border: rgb(0.86, 0.89, 0.95),
  panel: rgb(1, 1, 1),
  note: rgb(0.95, 0.97, 1),
};

function slugifyFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function sanitizeText(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/[•]/g, "-")
    .replace(/[–—]/g, "-")
    .replace(/[→⇒]/g, "->")
    .trim();
}

function wrapText(
  text: string,
  maxWidth: number,
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  fontSize: number,
) {
  const normalized = sanitizeText(text);

  if (!normalized) {
    return [];
  }

  const words = normalized.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = word;
      continue;
    }

    let fragment = "";

    for (const char of Array.from(word)) {
      const testFragment = `${fragment}${char}`;

      if (font.widthOfTextAtSize(testFragment, fontSize) <= maxWidth) {
        fragment = testFragment;
        continue;
      }

      if (fragment) {
        lines.push(fragment);
      }

      fragment = char;
    }

    currentLine = fragment;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawWrappedText({
  page,
  text,
  x,
  y,
  maxWidth,
  font,
  size,
  color,
  lineHeight,
}: {
  page: PDFPage;
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  font: PDFFont;
  size: number;
  color: Color;
  lineHeight: number;
}) {
  const lines = wrapText(text, maxWidth, font, size);
  let cursorY = y;

  lines.forEach((line) => {
    page.drawText(line, { x, y: cursorY, size, font, color });
    cursorY -= lineHeight;
  });

  return {
    lines,
    bottomY: cursorY,
    height: lines.length * lineHeight,
  };
}

export async function downloadDietPdf({
  tituloObjetivo,
  calorias,
  secoes,
  observacao,
  nomeArquivo,
}: DietaPdfPayload) {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  let page = pdfDoc.addPage([PAGE.width, PAGE.height]);
  let cursorY = PAGE.height - PAGE.marginTop;
  let pageNumber = 1;

  const drawPageHeader = (continued = false) => {
    page.drawRectangle({
      x: PAGE.marginX,
      y: PAGE.height - PAGE.marginTop + 8,
      width: 104,
      height: 24,
      color: COLORS.accentSoft,
      borderColor: COLORS.border,
      borderWidth: 0.8,
    });

    page.drawText("DIETA APROXIMADA", {
      x: PAGE.marginX + 12,
      y: PAGE.height - PAGE.marginTop + 16,
      size: 9,
      font: fontBold,
      color: COLORS.accent,
    });

    page.drawText(continued ? `${tituloObjetivo} - continua` : tituloObjetivo, {
      x: PAGE.marginX,
      y: PAGE.height - PAGE.marginTop - 8,
      size: 22,
      font: fontBold,
      color: COLORS.ink,
    });

    page.drawRectangle({
      x: PAGE.width - PAGE.marginX - 92,
      y: PAGE.height - PAGE.marginTop - 2,
      width: 92,
      height: 28,
      color: COLORS.accentSurface,
      borderColor: COLORS.border,
      borderWidth: 0.8,
    });

    page.drawText(`${calorias} kcal/dia`, {
      x: PAGE.width - PAGE.marginX - 78,
      y: PAGE.height - PAGE.marginTop + 8,
      size: 10,
      font: fontBold,
      color: COLORS.accent,
    });

    page.drawLine({
      start: { x: PAGE.marginX, y: PAGE.height - PAGE.marginTop - 20 },
      end: { x: PAGE.width - PAGE.marginX, y: PAGE.height - PAGE.marginTop - 20 },
      thickness: 1,
      color: COLORS.border,
    });

    cursorY = PAGE.height - PAGE.marginTop - 40;
  };

  const ensureSpace = (requiredHeight: number, sectionTitle?: string) => {
    if (cursorY - requiredHeight >= PAGE.marginBottom) {
      return;
    }

    page = pdfDoc.addPage([PAGE.width, PAGE.height]);
    pageNumber += 1;
    drawPageHeader(Boolean(sectionTitle));

    if (sectionTitle) {
      page.drawText(sectionTitle, {
        x: PAGE.marginX,
        y: cursorY,
        size: 15,
        font: fontBold,
        color: COLORS.ink,
      });

      cursorY -= 22;
    }
  };

  drawPageHeader(false);

  secoes.forEach((secao) => {
    const descricaoSecao = secao.descricao
      ? wrapText(secao.descricao, PAGE.width - PAGE.marginX * 2 - 36, fontRegular, 10)
      : [];

    ensureSpace(74 + descricaoSecao.length * 14, secao.titulo);

    page.drawRectangle({
      x: PAGE.marginX,
      y: cursorY - 18,
      width: PAGE.width - PAGE.marginX * 2,
      height: 44 + descricaoSecao.length * 14,
      color: COLORS.panel,
      borderColor: COLORS.border,
      borderWidth: 0.8,
    });

    page.drawRectangle({
      x: PAGE.marginX,
      y: cursorY - 18,
      width: 5,
      height: 44 + descricaoSecao.length * 14,
      color: COLORS.accent,
    });

    page.drawText(secao.titulo, {
      x: PAGE.marginX + 16,
      y: cursorY + 6,
      size: 15,
      font: fontBold,
      color: COLORS.ink,
    });

    if (secao.calorias) {
      const badgeWidth =
        fontBold.widthOfTextAtSize(secao.calorias, 10) + 20;
      const badgeX = PAGE.width - PAGE.marginX - badgeWidth - 16;

      page.drawRectangle({
        x: badgeX,
        y: cursorY + 2,
        width: badgeWidth,
        height: 22,
        color: COLORS.accentSoft,
        borderColor: COLORS.border,
        borderWidth: 0.8,
      });

      page.drawText(secao.calorias, {
        x: badgeX + 10,
        y: cursorY + 9,
        size: 10,
        font: fontBold,
        color: COLORS.accent,
      });
    }

    if (secao.descricao) {
      drawWrappedText({
        page,
        text: secao.descricao,
        x: PAGE.marginX + 16,
        y: cursorY - 12,
        maxWidth: PAGE.width - PAGE.marginX * 2 - 36,
        font: fontRegular,
        size: 10,
        color: COLORS.muted,
        lineHeight: 13,
      });
    }

    cursorY -= 32 + descricaoSecao.length * 14;

    secao.itens.forEach((item) => {
      const { descricao, calorias: caloriasItem } = separarItemECalorias(item);
      const cardX = PAGE.marginX + 14;
      const cardWidth = PAGE.width - PAGE.marginX * 2 - 14;
      const cardPaddingX = 16;
      const cardPaddingY = 14;
      const lineHeight = 14;
      const badgeGap = 14;
      const badgeHeight = 18;
      const badgeWidth = caloriasItem
        ? Math.max(54, fontBold.widthOfTextAtSize(caloriasItem, 9) + 18)
        : 0;
      const textAreaWidth =
        cardWidth -
        cardPaddingX * 2 -
        (caloriasItem ? badgeWidth + badgeGap : 0);
      const descriptionLines = wrapText(
        descricao,
        textAreaWidth,
        fontRegular,
        11,
      );
      const itemHeight = Math.max(
        48,
        descriptionLines.length * lineHeight + cardPaddingY * 2,
      );

      ensureSpace(itemHeight + 12, secao.titulo);

      const cardTopY = cursorY;
      const cardBottomY = cardTopY - itemHeight;
      const textX = cardX + cardPaddingX;
      const textTopY = cardTopY - cardPaddingY;
      const badgeTopY = cardTopY - cardPaddingY + 2;

      page.drawRectangle({
        x: cardX,
        y: cardBottomY,
        width: cardWidth,
        height: itemHeight,
        color: COLORS.panel,
        borderColor: COLORS.border,
        borderWidth: 0.8,
      });

      page.drawCircle({
        x: cardX + 10,
        y: cardTopY - cardPaddingY + 3,
        size: 2.5,
        color: COLORS.accent,
      });

      let lineY = textTopY;

      descriptionLines.forEach((line) => {
        page.drawText(line, {
          x: textX,
          y: lineY,
          size: 11,
          font: fontRegular,
          color: COLORS.ink,
        });
        lineY -= lineHeight;
      });

      if (caloriasItem) {
        const badgeX = cardX + cardWidth - cardPaddingX - badgeWidth;
        const badgeY = badgeTopY - badgeHeight;

        page.drawRectangle({
          x: badgeX,
          y: badgeY,
          width: badgeWidth,
          height: badgeHeight,
          color: COLORS.accentSoft,
          borderColor: COLORS.border,
          borderWidth: 0.8,
        });

        page.drawText(caloriasItem, {
          x: badgeX + 9,
          y: badgeY + 6,
          size: 9,
          font: fontBold,
          color: COLORS.accent,
        });
      }

      cursorY -= itemHeight + 8;
    });

    cursorY -= 10;
  });

  const noteLines = wrapText(
    observacao,
    PAGE.width - PAGE.marginX * 2 - 30,
    fontRegular,
    10,
  );
  const noteHeight = 42 + noteLines.length * 13;

  ensureSpace(noteHeight + 8);

  page.drawRectangle({
    x: PAGE.marginX,
    y: cursorY - noteHeight + 10,
    width: PAGE.width - PAGE.marginX * 2,
    height: noteHeight,
    color: COLORS.note,
    borderColor: COLORS.border,
    borderWidth: 0.8,
  });

  page.drawRectangle({
    x: PAGE.marginX,
    y: cursorY - noteHeight + 10,
    width: 5,
    height: noteHeight,
    color: COLORS.accent,
  });

  page.drawText("Aviso importante", {
    x: PAGE.marginX + 16,
    y: cursorY - 8,
    size: 11,
    font: fontBold,
    color: COLORS.ink,
  });

  drawWrappedText({
    page,
    text: observacao,
    x: PAGE.marginX + 16,
    y: cursorY - 26,
    maxWidth: PAGE.width - PAGE.marginX * 2 - 30,
    font: fontItalic,
    size: 10,
    color: COLORS.muted,
    lineHeight: 13,
  });

  for (let index = 0; index < pageNumber; index += 1) {
    const pdfPage = pdfDoc.getPage(index);
    pdfPage.drawText(`Pagina ${index + 1}`, {
      x: PAGE.width - PAGE.marginX - 42,
      y: 20,
      size: 9,
      font: fontRegular,
      color: COLORS.muted,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
  new Uint8Array(pdfBuffer).set(pdfBytes);
  const blob = new Blob([pdfBuffer], { type: "application/pdf" });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeFileName =
    nomeArquivo ||
    `dieta-${slugifyFileName(tituloObjetivo)}-${new Date().toISOString().slice(0, 10)}.pdf`;

  anchor.href = objectUrl;
  anchor.download = safeFileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);
}
