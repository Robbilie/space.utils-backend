FROM node:alpine

WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm install && npm cache clean

CMD [ "npm", "start" ]