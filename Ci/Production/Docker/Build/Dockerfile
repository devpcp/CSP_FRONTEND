# Compile nextjs
FROM node:16 AS compile
USER node
WORKDIR /home/node/app
COPY --chown=node:node . /home/node/app
RUN npm install
RUN npm run deploy

# Build container to run nginx
FROM nginx:1.20.2-alpine AS build
COPY --from=compile /home/node/app/out /usr/share/nginx/html
EXPOSE 80/tcp
