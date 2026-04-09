FROM node:20-alpine3.22

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# Vite necesita escuchar en 0.0.0.0 dentro de contenedor
CMD ["npm","run","dev","--","--host","0.0.0.0","--port","5173"]
