FROM node:16
USER node
WORKDIR /home/node/app
COPY --chown=node:node . /home/node/app
RUN npm install
EXPOSE 3000/tcp
CMD "npm" "run" "dev"