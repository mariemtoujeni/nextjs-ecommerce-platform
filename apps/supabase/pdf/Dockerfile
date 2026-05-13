FROM node:20-alpine

ENV CHROME_BIN=/usr/bin/chromium-browser
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN apk add g++ make py3-pip  build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    font-terminus font-inconsolata font-dejavu font-noto font-noto-cjk font-awesome font-noto-extra



RUN set -eux; \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories; \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories; \
    apk add --no-cache chromium@edge nss@edge

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
# Install before copying the rest of the files to cache the dependencies
RUN pnpm install
COPY src ./src

CMD node src/index.js