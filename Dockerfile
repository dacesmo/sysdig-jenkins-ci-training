FROM node:14-slim

WORKDIR /usr/src/app

COPY app.js .

EXPOSE 3000

USER 1000

CMD [ "node", "app.js" ]
