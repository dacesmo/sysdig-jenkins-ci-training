FROM node:14-slim

WORKDIR /usr/src/app

COPY app.js .

EXPOSE 3000

USER 1000

CMD [ "node", "app.js" ]

LABEL org.opencontainers.image.source=https://github.com/dacesmo/sysdig-jenkins-ci-training

LABEL org.opencontainers.image.description="My Test Image for Sysdig CICD Training"
