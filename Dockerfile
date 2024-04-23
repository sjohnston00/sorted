# base node image
FROM node:21-bullseye-slim as base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl

WORKDIR /sorted

ADD . .
RUN npm install
ENV NODE_ENV production

EXPOSE 3000

RUN npx prisma generate

RUN npm run build

# Run migrations
# ARG DATABASE_URL
# RUN npm run deploy:db

CMD ["npm", "start"]
