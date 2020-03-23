FROM debian:latest

RUN mkdir $HOME/gopath
ENV GOPATH=$HOME/gopath

RUN apt-get update 
RUN apt-get install -y git 
RUN apt-get install -y make 
RUN apt-get install -y golang
RUN apt-get install -y python3 python3-git
RUN apt-get install -y fakeroot
RUN apt-get install -y npm

RUN npm install -g @angular/cli

RUN go get github.com/basgys/goxml2json
RUN go get github.com/gorilla/websocket

COPY build-all.sh .

CMD sh ./build-all.sh