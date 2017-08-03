#!/bin/bash

#root check
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

#copy all required files to the package folders
PACKAGE_NAME="lan-monitor"

#This is of the html, css, javascript and webcontent
HTML_DESTINATION_DIR=$PACKAGE_NAME/var/www/$PACKAGE_NAME
mkdir -p ./$HTML_DESTINATION_DIR
cp ../index.html ./$HTML_DESTINATION_DIR/
cp -r ../css ./$HTML_DESTINATION_DIR/
cp -r ../img ./$HTML_DESTINATION_DIR/
cp -r ../js ./$HTML_DESTINATION_DIR/

#This is for the nginx site specific file
#see also DEBIAN conffiles
mkdir -p $PACKAGE_NAME/etc/nginx/sites-available
cp ../config/nginx-site $PACKAGE_NAME/etc/nginx/sites-available/$PACKAGE_NAME

#This is for the scan binary/script
mkdir -p $PACKAGE_NAME/usr/bin
cp ../bin/lan-monitor-scan.sh $PACKAGE_NAME/usr/bin/


#required for debians sake
chown -R root:root $PACKAGE_NAME

#build the package
dpkg-deb --build $PACKAGE_NAME

#needs to be adapted to current user (otherwise I can not edit it due to the changed owner)
chown -R tkrueger:tkrueger $PACKAGE_NAME

#remove the copied files for version control peace
rm -rf $PACKAGE_NAME/var 
rm -rf $PACKAGE_NAME/usr
rm -rf $PACKAGE_NAME/etc/nginx/sites-available/$PACKAGE_NAME
