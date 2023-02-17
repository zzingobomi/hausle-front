FROM node:16 AS builder

WORKDIR /hausle-front
COPY . .
RUN npm install
RUN npm run build

FROM nginx:latest

COPY --from=builder /hausle-front/build /usr/share/nginx/html
CMD ["nginx","-g","daemon off;"]