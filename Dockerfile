FROM ubuntu:groovy

WORKDIR /

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt install bc -y

# Download node
RUN apt install curl -y
RUN apt install nodejs -y
RUN apt install npm -y
RUN node -v

# Download GNU
RUN apt install build-essential -y
RUN gcc -v

# Remove unnecessary
RUN apt autoremove -y

# Copy project
COPY package.json package.json
RUN npm i

COPY . .
CMD npm start