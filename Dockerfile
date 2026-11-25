FROM node:22.22.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build -- --output-path=dist/compraamigo

FROM nginx:stable-alpine
ENV PORT=8080 \
    BACKEND_HOST=backend.railway.internal \
    BACKEND_PORT=8080
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/compraamigo/browser/ /usr/share/nginx/html/
EXPOSE 8080
