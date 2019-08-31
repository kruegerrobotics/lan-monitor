FROM debian:latest

RUN apt-get update
RUN apt-get install wget -y
RUN apt-get install nmap -y

RUN wget https://github.com/kruegerrobotics/lan-monitor/releases/download/v2.0.1/lan-monitor_v2.0.1_amd64.deb

RUN dpkg -i lan-monitor_v2.0.1_amd64.deb

CMD echo "still there" 