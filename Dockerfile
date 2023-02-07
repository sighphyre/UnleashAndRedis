FROM node:16

WORKDIR /app

COPY "index.js" "index.js"
COPY "package.json" "package.json"

RUN npm install

CMD [ "node", "index.js" ]
