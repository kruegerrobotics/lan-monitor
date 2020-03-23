FROM node:lts-buster

RUN mkdir $HOME/gopath
ENV GOPATH=$HOME/gopath

RUN apt-get update 
RUN apt-get install -y git 
RUN apt-get install -y make 
RUN apt-get install -y golang
RUN apt-get install -y python3 python3-git
RUN apt-get install -y fakeroot

RUN npm install -g --silent @angular/cli

RUN go get github.com/basgys/goxml2json
RUN go get github.com/gorilla/websocket

COPY build-all.sh .

CMD sh ./build-all.sh