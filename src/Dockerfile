FROM node:18

WORKDIR /home/student/neuedaTraining/src

COPY package*.json package.json

RUN npm install 

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]

