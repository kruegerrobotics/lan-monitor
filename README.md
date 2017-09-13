# lan-monitor

## Dowload here [github-release](https://github.com/KruDex/lan-monitor/releases/latest)

## What it does

This software builds a dynamic graphical website showing the results of a NMAP scan. This tool has an integrated webserver to display this website with the hostnames, IP addresses and selected open ports.

[alt text](www/doc/website_impression.png "Impression of the scan result as website")

## Ideas and intentions

## Scanning local area networks

It was the original intend to get a quick overview of local laboratory or home networks. Basically to see immideately the status of the computers connected. Meaning the important open ports (ssh, http) and also if a computers have been switched off. In our laboratory network with a lot of embedded devices. A website, accessible by everybody inside, with the real time network status helped to see if a certain device is online and accessible.

### Scanning public IP-addresses

From some interactions I learned that this could be also of interest. I would be happy to learn with features might be interesting here. e.g. scan more ports, display them, nmap --top-ports, ... **just raise an issue and we can work on it together**

## Features

- Easy to understand graphical representation
- Shows the hostname and IP address
- Shows if the computer is running a webserver with clickable link
- Shows is the computer is accessible via SSH
- Shows if a computer has gone offline

## How it works

It is based on a periodically executed nmap scan. The result of this scan, a xml file, is parsed by the JavaScript and represented as html page with boxes presenting information for each computer.

## Installation

### Installation by using the provided Debian package

If running on Debian or a deb base package manager you can use the debian packages provided [here](https://github.com/KruDex/lan-monitor/releases/latest).

#### WARNINGS for debian package

It automatically starts a webserver on port 8080. In case another application is using this port it will fail starting or prevents the other application from start. The port can be configured either in the config file */etc/lan-monitor.conf* or using the commandline option.

##### Not everything is automatic or configurable by the web interface (yet)

The ip range or adresses that are planned to scan are either set in the config file  */etc/lan-monitor.conf* or command line option.

#### Installation procedure

This package requires nmap you can install it by typing:

```bash
apt install nmap
```

Installation of the package

```bash
dpkg -i lan-monitor.deb
```

If nmap is not installed apt will complain and the missing package. It can be installed by typing:

```bash
apt-get install -f
```

### Manual installation

To install the required components and the configuration of the webserver can also be done manually. This is recommended if there are is already a webserver is in use and/or for greater control of the system.

#### Files for the website

The files to display the website are in the www folder of this repository. The scan.xml from the NMAP scan results needs to be in the same location as the index.html.

#### Webserver executable

The executable, managing the periodic scan and serving the webpages is a go executable. It expects the website in a path *../www relative* to it. Later this should be configurable via a config file.

#### NMAP installation

The source file for the parsing is build on a nmap scan result in xml format. On Debian it can be installed by

```bash
apt get install nmap
```

### Test the installation

If you enter not the ip address or the computer name in the browser it should display the computers in the lan e.g. (http://192.168.1.2:8080) on the computer itself (http://127.0.01:8080). It can take a few minutes until the first nmap scan is completed. There should be the file scan.xml in the */var/opt/lan-monitor* folder.

## Used NMAP Options for the scan

- -p for scanning the ports 22 and 80
- -oX output file