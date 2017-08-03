# lan-monitor

## What it does

This software builds a dynamic graphical website showing the computers with their hostnames and IP addresses in the local network.

It is for laboratory or home type networks to get a quick impression of the computers online without requiring additional soft or hardware.

![alt text](/doc/website_impression.png "Impression of the scan result as website")

## Features

- Easy to understand graphical representation
- Shows the hostname and IP address
- Shows if the computer is running a webserver with clickable link
- Shows is the computer is accessible via SSH
- Shows if a computer has gone offline

## How it works

It is based on a periodically executed nmap scan. The result of this scan, a xml file, is parsed by the JavaScript and represented as html page with boxes presenting information for each computer.

## Installation

### Automatic installation by using the provided Debian package

If running on Debian or a deb base package manage you can use the debian package provided here.

#### WARNINGS for debian package

Here are some tradeoffs between configuring a webserver and a out of the pocket solution. If a step by step approach is required, please read below the manual installation procedure.

##### Deletion in nginx default webpage config

This will install everything automatically especially the webserver settings and it will DELETE the default nginx page. *This has been done for better automation but has this draw back - I am investigating a better solution*

##### Not everything is automatic

The ip range that has to be scanned needs for not to be set in the file /usr/bin/lan-monitor-scan.sh (default is 192.168.1.0/24)

### Automatic installation procedure

This package requires nmap and nginx, you can install these by typing:

```bash
apt install nmap nginx
```

Installation of the package

```bash
dpkg -i lan-monitor.deb
```

If nmap and nginx are not installed apt will complain and the missing packages can be installed by typing:

```bash
apt-get install -f
```

### Test the install

If you enter not the ip address or the computer name in the browser it should display the computers in the lan e.g. http://192.168.1.2 or http://myserver. It can take 3 minutes until the first nmap scan is completed. There should be the file scan.xml in the */var/www/lan-monitor* folder.

### Manual installation

To install the required components and the configuration of the webserver can also be done manually. This is recommended if there are is already a webserver is in use and/or for greater control of the system

#### Webserver

A common webserver like nginx can be used with this repository checked out at the  website path e.g. /var/www/html

#### NMAP installation

The source file for the parsing is build on a nmap scan result in xml format. On Debian it can be installed by

```bash
apt get install nmap
```

#### Periodic scanning via crontab

Installing a crontab as root

```bash
crontab -e
```

Using crontab to run it e.g. every 2 minutes:

`*/2 * * * * /usr/bin/lan-monitor-scan.sh`

#### NMAP scan configuration - contents of scan_lan.sh

```bash
#!/bin/sh
#the folder where the webserver expects the scan report
HTML_FOLDER=/var/www/lan-monitor
 
#TODO get the IP range to scan from the conf file

nmap -p 22,80 -oX $HTML_FOLDER/last_scan.xml 192.168.1.0/24
cp  $HTML_FOLDER/last_scan.xml  $HTML_FOLDER/scan.xml
rm $HTML_FOLDER/last_scan.xml
```

 The path, here /var/www/html should be the same as in the used webserver

#### Detailed NMAP Options

- -p for scanning the ports 22 and 80
- -oX output file
- scanning the 192.168.1.0/24 subnet
