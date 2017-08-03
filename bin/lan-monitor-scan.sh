#the folder where the webserver expects the scan report
HTML_FOLDER=/var/www/lan-monitor
 
#TODO get the IP range to scan from the conf file

nmap -p 22,80 -oX $HTML_FOLDER/last_scan.xml 192.168.1.0/24
cp  $HTML_FOLDER/last_scan.xml  $HTML_FOLDER/scan.xml
rm $HTML_FOLDER/last_scan.xml
