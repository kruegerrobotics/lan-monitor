#!/bin/bash

#root check
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

#copy all required files to the package folders
PACKAGE_NAME="lan-monitor"
HTML_DESTINATION_DIR=$PACKAGE_NAME/var/www/$PACKAGE_NAME
mkdir -p ./$HTML_DESTINATION_DIR
cp ../index.html ./$HTML_DESTINATION_DIR/
cp -r ../css ./$HTML_DESTINATION_DIR/
cp -r ../img ./$HTML_DESTINATION_DIR/
cp -r ../js ./$HTML_DESTINATION_DIR/

#required for debians sake
chown -R root:root $PACKAGE_NAME

#build the package
dpkg-deb --build $PACKAGE_NAME

#needs to be adapted to current user 
chown -R tkrueger:tkrueger $PACKAGE_NAME