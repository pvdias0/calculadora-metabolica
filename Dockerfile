# =============================================================================
# BUILD STAGE - Compila e constrói a aplicação Next.js
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de dependências (mais leve que copiar tudo)
COPY package.json pnpm-lock.yaml ./

# Instala pnpm globalmente e todas as dependências
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile

# Copia o código-fonte da aplicação
COPY . .

# Compila a aplicação Next.js (gera o build otimizado em .next/)
RUN pnpm build

# =============================================================================
# PRODUCTION STAGE - Imagem final otimizada (sem código-fonte)
# =============================================================================
FROM node:20-alpine

WORKDIR /app

# Define modo de produção (otimiza performance)
ENV NODE_ENV=production

# Instala pnpm
RUN npm install -g pnpm

# Copia apenas os arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instala APENAS dependências de produção (sem devDependencies)
RUN pnpm install --no-frozen-lockfile --prod

# Copia arquivos compilados do stage anterior (build otimizado)
COPY --from=builder /app/.next ./.next

# Copia arquivos públicos (imagens, etc)
COPY --from=builder /app/public ./public

# Expõe a porta 3000 (documentação, não força a porta)
EXPOSE 3000

# Comando para iniciar a aplicação em produção
CMD ["pnpm", "start"]
