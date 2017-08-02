#!/bin/sh
#the folder where the webserver looks
HTML_FOLDER=/var/www/lan-monitor
 
#get the IP range to scan from the conf file

nmap -p 22,80 -oX $HTML_FOLDER/last_scan.xml 192.168.0.0/24
cp  $HTML_FOLDER/last_scan.xml  $HTML_FOLDER/scan.xml
rm last_scan.xml