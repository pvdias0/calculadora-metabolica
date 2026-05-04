# =============================================================================
# BUILD STAGE - Compila e constrói a aplicação Next.js
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de dependências (mais leve que copiar tudo)
COPY package.json package-lock.json ./

# Instala todas as dependências usando o lockfile versionado
RUN npm ci

# Copia o código-fonte da aplicação
COPY . .

# Compila a aplicação Next.js (gera o build otimizado em .next/)
RUN npm run build

# =============================================================================
# PRODUCTION STAGE - Imagem final otimizada (sem código-fonte)
# =============================================================================
FROM node:20-alpine

WORKDIR /app

# Define modo de produção (otimiza performance)
ENV NODE_ENV=production

# Copia apenas os arquivos de dependências
COPY package.json package-lock.json ./

# Instala APENAS dependências de produção (sem devDependencies)
RUN npm ci --omit=dev

# Copia arquivos compilados do stage anterior (build otimizado)
COPY --from=builder /app/.next ./.next

# Copia arquivos públicos (imagens, etc)
COPY --from=builder /app/public ./public

# Expõe a porta 3000 (documentação, não força a porta)
EXPOSE 3000

# Comando para iniciar a aplicação em produção
CMD ["npm", "run", "start"]
