FROM node:22-alpine AS base

ARG APP

ENV PNPM_HOME=/usr/local
ENV PATH=$PNPM_HOME:$PATH

RUN apk update
RUN apk add --no-cache libc6-compat
RUN corepack install -g pnpm@latest-10
RUN corepack enable pnpm
RUN pnpm add -g turbo typescript

RUN mkdir -p /tmp/app
ADD . /tmp/app
WORKDIR /tmp/app
RUN turbo prune $APP --docker

# Builder stage
FROM base AS builder

WORKDIR /app
COPY --from=base /tmp/app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=base /tmp/app/out/full/ .
RUN pnpm build

# Runner stage
FROM node:22-alpine AS runner
ARG APP
ENV APP=$APP

WORKDIR /app

RUN addgroup --system --gid 1001 user
RUN adduser --system --uid 1001 user

USER user

COPY --from=builder --chown=user:user /app/apps/$APP/.next/standalone ./
COPY --from=builder --chown=user:user /app/apps/$APP/.next/static ./apps/$APP/.next/static
COPY --from=builder --chown=user:user /app/apps/$APP/public ./apps/$APP/public

CMD ["sh", "-c", "node apps/$APP/server.js"]