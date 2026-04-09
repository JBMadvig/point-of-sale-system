FROM node:22-alpine3.21

RUN apk add --no-cache vips-dev build-base python3

WORKDIR /usr/src/server

COPY package*.json .

RUN npm install --os=linux --libc=musl --cpu=arm64 sharp
RUN npm ci

COPY . .
