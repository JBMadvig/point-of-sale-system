# --- Dev stage -------------------------------------------------------------
FROM node:22-slim AS dev

WORKDIR /app

# Copy only the package files to leverage caching and prevent overwriting
COPY package*.json ./

RUN npm ci

# Now copy everything else
COPY . .

EXPOSE 4200

CMD ["npm", "run", "dev"]


# --- Build stage -------------------------------------------------------------
FROM node:22-slim AS build

WORKDIR /app

# Copy only the package files to leverage caching and prevent overwriting
COPY package*.json ./

RUN npm ci

# Now copy everything else
COPY . .

RUN npm run build

# --- Prod stage -------------------------------------------------------------
FROM nginx:1.27-alpine AS prod

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80