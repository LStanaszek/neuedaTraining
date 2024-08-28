FROM node:18

WORKDIR /home/student/neuedaTraining/src


COPY package*.json ./neuedaTraining/src

RUN npm install 

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]

