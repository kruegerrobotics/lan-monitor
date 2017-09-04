PACKAGE_NAME=lan-monitor
INSTALL_DIRECTORY=/opt/$PACKAGE_NAME
PACKAGE_DATA_DIR=$(PACKAGE_NAME)/opt/$(PACKAGE_NAME)
HTML_DESTINATION_DIR=$(PACKAGE_DATA_DIR)/www

all : build_package

compose_pkg_files : copy_www_files 

build_package : root_check copy_www_files build_all_binaries
	#required for debians sake
	chown -R root:root $(PACKAGE_NAME)
	
	#build the package
	dpkg-deb --build $(PACKAGE_NAME)
	
	#needs to be adapted to current user (otherwise I can not edit it due to the changed owner)
	chown -R tkrueger:tkrueger $(PACKAGE_NAME)

root_check:
	./runasroot.sh

#moving files to the destination dirs for buidling the package
copy_www_files : 
	
	mkdir -p ./$(HTML_DESTINATION_DIR)
	cp ../index.html ./$(HTML_DESTINATION_DIR)/
	cp -r ../css ./$(HTML_DESTINATION_DIR)/
	cp -r ../img ./$(HTML_DESTINATION_DIR)/
	cp -r ../js ./$(HTML_DESTINATION_DIR)/

#Building of the webserver binaries
build_all_binaries : build_x86_linux build_x86_64_linux build_arm_linux	

build_x86_linux : 
	mkdir -p $@; 
	cd ../lan-monitor-server; \
	GOOS=linux GOARCH=386 go build 
	mv ../lan-monitor-server/lan-monitor-server $@/

build_x86_64_linux : 
	mkdir -p $@; 
	cd ../lan-monitor-server; \
	GOOS=linux GOARCH=amd64 go build 
	mv ../lan-monitor-server/lan-monitor-server $@/

build_arm_linux : 
	mkdir -p $@; 
	cd ../lan-monitor-server; \
	GOOS=linux GOARCH=arm go build 
	mv ../lan-monitor-server/lan-monitor-server $@/

clean : clean_builds clean_package clean_package_files

clean_builds : 
	rm -rf build_arm_linux
	rm -rf build_x86_64_linux
	rm -rf build_x86_linux

clean_package_files :
	rm -rf $(PACKAGE_DATA_DIR)

clean_package : 
	rm -rf lan-monitor.deb