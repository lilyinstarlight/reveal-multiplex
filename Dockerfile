FROM node:alpine as build

ENV NODE_ENV production

COPY . .

RUN npm install

FROM node:alpine

ENV NODE_ENV production

COPY . .
COPY --from=build node_modules ./

EXPOSE 1948

USER node
