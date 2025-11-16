FROM node:lts-alpine
LABEL authors="OpenHealth"

# Install coreutils for head
RUN apk add coreutils

RUN apk add -U graphicsmagick ghostscript

WORKDIR /app

COPY package.json prisma/ .

RUN npm install

COPY . .

RUN export ENCRYPTION_KEY=$(head -c 32 /dev/urandom | base64) && \
    npm run build && \
    adduser --disabled-password ohuser && \
    chown -R ohuser .

USER ohuser
EXPOSE 3000
ENTRYPOINT ["sh", "-c", "npx prisma db push --accept-data-loss && npx prisma db seed && npm start"]
