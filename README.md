# LAN-monitoring-website
# What it does
This software builds a dynamic graphical website showing the computers with their hostnames and IP addresses in the local network.

It is for laboratory or home type networks to get a quick impression of the computers online without requiring additional soft or hardware.

![alt text](/doc/website_impression.png "Impression of the scan result as website")


### Features
- Easy to understand graphical representation
- Shows the hostname and IP address
- Shows if the computer is running a webserver with clickable link
- Shows is the computer is accessible via SSH  
- Shows if a computer has gone offline

# How it works
It is based on a periodically executed nmap scan. The result of this scan, a xml file, is parsed by the JavaScript and represented as html page with boxes presenting information for each computer.

# Prerequisites
## Webserver
A common webserver like nginx can be used with this repository checked out at the  website path e.g. /var/www/html

## NMAP
The source file for the parsing is build on a nmap scan result in xml format

### Installation
On Debian
```bash
#>apt-get install nmap
```
### Periodic scanning
Installing a crontab
```bash
#>crontab -e
```
Using crontab to run it e.g. every 2 minutes:

`*/2 * * * * /usr/local/bin/scan_lan.sh`

 **scan_lan.sh**
 ```bash
#!/bin/sh
nmap -p 22,80 -oX /var/www/html/scan.xml 192.168.1.0/24
 ```

 The path, here /var/www/html should be the same as in the used webserver

**NMAP Options**
 - -p for scanning the ports 22 and 80
 - -oX output file
 - scanning the 192.168.1.0/24 subnet
