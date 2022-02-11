FROM node:alpine as build

ENV NODE_ENV production

COPY . .

RUN npm install

FROM node:alpine

ARG VERSION=latest
ARG REVISION=1
ARG BUILD_DATE=2022-02-11

LABEL maintainer="Lily Foster <lily@lily.flowers>" \
  org.opencontainers.image.created=$BUILD_DATE \
  org.opencontainers.image.authors="Lily Foster <lily@lily.flowers>" \
  org.opencontainers.image.url="https://github.com/lilyinstarlight/reveal-multiplex" \
  org.opencontainers.image.documentation="https://github.com/lilyinstarlight/reveal-multiplex" \
  org.opencontainers.image.source="https://github.com/lilyinstarlight/reveal-multiplex" \
  org.opencontainers.image.version=$VERSION \
  org.opencontainers.image.revision=$REVISION \
  org.opencontainers.image.vendor="Lily Foster <lily@lily.flowers>" \
  org.opencontainers.image.licenses="MIT" \
  org.opencontainers.image.title="fooster-reveal-multiplex" \
  org.opencontainers.image.description="A web application for generating token and id pairs for multiplex functionality of reveal.js"

ENV NODE_ENV production

COPY . .
COPY --from=build node_modules ./node_modules

EXPOSE 1948

USER node

CMD [ "npm", "start" ]
