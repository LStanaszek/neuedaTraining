FROM node:18

WORKDIR /home/student/neuedaTraining


COPY package*.json ./neuedaTraining/

RUN npm install 

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]

