FROM debian:latest

RUN apt-get update
RUN apt-get install wget -y
RUN apt-get install nmap -y

COPY download_and_run.sh .

EXPOSE 8080

CMD sh ./download_and_run.sh
