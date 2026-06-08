# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .

# Baked into the production bundle at build time (override with docker build --build-arg).
ARG API_BASE_URL=http://smart-grampanchayat-api-alb-1209278946.ap-south-1.elb.amazonaws.com
RUN sed -i "s|PRODUCTION_API_BASE_URL =.*|PRODUCTION_API_BASE_URL = '${API_BASE_URL}';|" src/environments/api-url.ts \
  && npm run build -- --configuration production

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/smart-grampanchayat-web/browser /usr/share/nginx/html

EXPOSE 80
