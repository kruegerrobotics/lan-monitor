#!/bin/bash

PACKAGE_DIR=pkg-build

VERSION=$(grep -o -P "\d+[.]\d+[.]\d+" main.go)

EXECUTABLE=test_go
EXECUTABLE_PATH=usr/bin/

#remove old dir and files
rm -rf $PACKAGE_DIR
mkdir -p $PACKAGE_DIR

declare -a BUILD_ARCHITECTURES=("386" "amd64")

for arch in "${BUILD_ARCHITECTURES[@]}"
do
	echo "Building $arch executable"
   	mkdir -p $PACKAGE_DIR/$arch
	GOOS=linux GOARCH=$arch go build
	
	#create the control file
	mkdir -p $PACKAGE_DIR/$arch/DEBIAN
	CTRL_FILE=$PACKAGE_DIR/$arch/DEBIAN/control
	
	if [ $arch == "386" ]; then
		LINUX_ARCH="i386"
	else
		LINUX_ARCH=$arch
	fi
	
	
	echo "Package: targetdaemon" > $CTRL_FILE
	echo "Version: $VERSION" >> $CTRL_FILE
	echo "Section: custom" >> $CTRL_FILE
	echo "Priority: optional" >> $CTRL_FILE
	echo "Architecture: $LINUX_ARCH" >> $CTRL_FILE
	echo "Essential: no" >> $CTRL_FILE
	echo "Installed-Size: 1024" >> $CTRL_FILE
	echo "Maintainer: Thomas Krueger" >> $CTRL_FILE
	echo "Description: deamon for filetranfers and control" >> $CTRL_FILE
	
	#data and directories for installation
	mkdir -p $PACKAGE_DIR/$arch/$EXECUTABLE_PATH
	mv targetdaemon $PACKAGE_DIR/$arch/$EXECUTABLE_PATH
	
	#directory for the system d
	mkdir -p $PACKAGE_DIR/$arch/etc/systemd/system
	cp targetdaemon.service $PACKAGE_DIR/$arch/etc/systemd/system/
	
	#create the postinst file
	POSTINST_FILE=$PACKAGE_DIR/$arch/DEBIAN/postinst
	echo "#!/bin/bash" > $POSTINST_FILE
	echo "echo Starting the new service" >> $POSTINST_FILE
	echo "systemctl enable targetdaemon" >> $POSTINST_FILE
	echo "systemctl start targetdaemon" >> $POSTINST_FILE
	chmod a+x $POSTINST_FILE
	
	#create the debian package
	dpkg-deb --build $PACKAGE_DIR/$arch
	mv "$PACKAGE_DIR/$arch.deb" targetdaemon"_"$arch.deb

done