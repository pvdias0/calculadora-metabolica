#!/usr/bin/env node
/**
 * Script para gerar ícones PNG a partir do SVG
 * Instale: npm install -D sharp
 * Execute: node generate-icons.js
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "public");

// SVG para ícone light (fundo branco)
const lightSvg = `<svg width="32" height="32" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="37" fill="white" />
  <g style="transform: translate(90px, 90px); transform-origin: center">
    <line x1="0" y1="-30" x2="0" y2="15" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/>
    <line x1="0" y1="-25" x2="-35" y2="-25" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/>
    <rect x="-48" y="-20" width="26" height="6" fill="#0ea5e9" rx="2"/>
    <line x1="0" y1="-25" x2="35" y2="-25" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/>
    <rect x="22" y="-20" width="26" height="6" fill="#0ea5e9" rx="2"/>
    <rect x="-12" y="15" width="24" height="8" fill="#0ea5e9" rx="2"/>
    <line x1="-8" y1="23" x2="-15" y2="30" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round"/>
    <line x1="8" y1="23" x2="15" y2="30" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>`;

// SVG para ícone dark (fundo preto)
const darkSvg = `<svg width="32" height="32" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="37" fill="black" />
  <g style="transform: translate(90px, 90px); transform-origin: center">
    <line x1="0" y1="-30" x2="0" y2="15" stroke="#06b6d4" stroke-width="3" stroke-linecap="round"/>
    <line x1="0" y1="-25" x2="-35" y2="-25" stroke="#06b6d4" stroke-width="3" stroke-linecap="round"/>
    <rect x="-48" y="-20" width="26" height="6" fill="#06b6d4" rx="2"/>
    <line x1="0" y1="-25" x2="35" y2="-25" stroke="#06b6d4" stroke-width="3" stroke-linecap="round"/>
    <rect x="22" y="-20" width="26" height="6" fill="#06b6d4" rx="2"/>
    <rect x="-12" y="15" width="24" height="8" fill="#06b6d4" rx="2"/>
    <line x1="-8" y1="23" x2="-15" y2="30" stroke="#06b6d4" stroke-width="2" stroke-linecap="round"/>
    <line x1="8" y1="23" x2="15" y2="30" stroke="#06b6d4" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>`;

async function generateIcons() {
  try {
    console.log("Gerando ícones...");

    // Gerar ícone light 32x32
    await sharp(Buffer.from(lightSvg))
      .resize(32, 32, { fit: "cover" })
      .png()
      .toFile(path.join(publicDir, "icon-light-32x32.png"));
    console.log("✓ icon-light-32x32.png criado");

    // Gerar ícone dark 32x32
    await sharp(Buffer.from(darkSvg))
      .resize(32, 32, { fit: "cover" })
      .png()
      .toFile(path.join(publicDir, "icon-dark-32x32.png"));
    console.log("✓ icon-dark-32x32.png criado");

    // Gerar apple icon 180x180
    await sharp(Buffer.from(lightSvg))
      .resize(180, 180, { fit: "cover" })
      .png()
      .toFile(path.join(publicDir, "apple-icon.png"));
    console.log("✓ apple-icon.png criado");

    console.log("\n✅ Todos os ícones foram gerados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao gerar ícones:", error);
    process.exit(1);
  }
}

generateIcons();
