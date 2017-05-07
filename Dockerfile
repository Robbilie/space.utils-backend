FROM node:alpine

RUN apk update && apk upgrade && apk add git

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package.json /usr/src/app/
RUN npm install && npm cache clean
COPY ./src/ /usr/src/app/src
COPY ./specs/ /usr/src/app/specs
COPY ./index.js /usr/src/app/

CMD [ "npm", "start" ]
EXPOSE 4001 4002 4003