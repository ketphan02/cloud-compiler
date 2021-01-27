FROM node:12.18-alpine

WORKDIR /JavaScript
COPY ["package.json", "./"]
RUN npm install --silent
COPY . .
CMD ["npm", "start"]
