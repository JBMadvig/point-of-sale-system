FROM node:22-slim

WORKDIR /usr/client

# Copy only the package files to leverage caching and prevent overwriting
COPY package*.json ./

RUN npm ci

# Now copy everything else
COPY . .

EXPOSE 4200

CMD ["npm", "start"]
