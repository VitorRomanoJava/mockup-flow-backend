# ---- Base Stage ----
# Usamos uma imagem Node.js 20 baseada no Alpine para ser leve e segura.
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# ---- Dependencies Stage ----
# Instala somente as dependências para aproveitar o cache do Docker.
# Isso evita reinstalar tudo a cada mudança no código.
FROM base AS dependencies
COPY package.json pnpm-lock.yaml* ./
# O pnpm-lock.yaml pode não existir se você usou npm/yarn, o asterisco lida com isso.
# Usamos 'pnpm' conforme indicado no package.json, com a flag --frozen-lockfile para builds consistentes.
RUN npm i -g pnpm && pnpm i --frozen-lockfile

# ---- Build Stage ----
# Compila o código TypeScript para JavaScript.
FROM base AS build
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
# Gera o cliente Prisma com base no schema.
RUN npm i -g pnpm && pnpm prisma generate
# Compila o projeto.
RUN pnpm build

# ---- Production Stage ----
# Prepara a imagem final, copiando apenas o necessário para rodar a aplicação.
FROM base as production
ENV NODE_ENV=production
# Copia as dependências de produção.
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
# Copia o código compilado.
COPY --from=build /usr/src/app/dist ./dist
# Copia o schema do Prisma para o cliente gerado encontrá-lo em tempo de execução.
COPY prisma ./prisma

# Expõe a porta que a aplicação vai usar.
EXPOSE 3000

# Comando para iniciar a aplicação.
CMD ["node", "dist/main"]