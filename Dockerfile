FROM node:18-alpine

WORKDIR /app

COPY . .

# 🌊 Install Dependencies
RUN yarn

# 🔨 Build App...
RUN yarn build

# 😎 Rebuild Swagger
RUN yarn swagger

# 💯 Last Configuration
RUN sed -i 's/localhost/host.docker.internal/g' .env

EXPOSE 8080
ENV NODE_ENV=development
CMD ["yarn", "start:only"]
