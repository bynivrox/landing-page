# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS build
# Pages are prerendered, so the links are fixed at build time.
ARG APP_URL
ARG CONTACT_URL
ARG SIGNUP_URL
ARG SELF_HOST_URL
ARG MANAGEMENT_URL
ENV APP_URL=$APP_URL CONTACT_URL=$CONTACT_URL SIGNUP_URL=$SIGNUP_URL \
    SELF_HOST_URL=$SELF_HOST_URL MANAGEMENT_URL=$MANAGEMENT_URL NEXT_OUTPUT=standalone
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3200 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3200
CMD ["node", "server.js"]
