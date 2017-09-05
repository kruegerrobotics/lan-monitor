PACKAGE_NAME=lan-monitor
INSTALL_DIRECTORY=/opt/$PACKAGE_NAME
PACKAGE_DATA_DIR=$(PACKAGE_NAME)/opt/$(PACKAGE_NAME)
HTML_DESTINATION_DIR=$(PACKAGE_DATA_DIR)/www

VERSION=$(shell ./createcontrolfile.py -v)

all : build_package
	
compose_pkg_files : copy_www_files 
		
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
build_all_binaries : build_x86_linux_exec build_x86_64_linux_exec build_arm_linux_exec	

build_all_packages : build_x86_linux_pkg

build_x86_linux_pkg : copy_www_files build_x86_linux_exec
	mkdir -p $@
	mkdir -p $@/$(PACKAGE_NAME)/opt/$(PACKAGE_NAME)/bin
	cp -r $(PACKAGE_NAME) $@/
	./createcontrolfile.py -a i386 -t control.tmpl -d $@/$(PACKAGE_NAME)/DEBIAN/control
	cp build_x86_linux_exec/lan-monitor-server $@/$(PACKAGE_NAME)/opt/$(PACKAGE_NAME)/bin/
	
	#build the $@ with version $(VERSION)
	fakeroot dpkg --build $@/$(PACKAGE_NAME) $(PACKAGE_NAME)_$(VERSION)_i386.deb
	

build_x86_linux_exec : 
	mkdir -p $@; 
	cd ../lan-monitor-server; \
	GOOS=linux GOARCH=386 go build 
	mv ../lan-monitor-server/lan-monitor-server $@/

build_x86_64_linux_exec : 
	mkdir -p $@; 
	cd ../lan-monitor-server; \
	GOOS=linux GOARCH=amd64 go build 
	mv ../lan-monitor-server/lan-monitor-server $@/

build_arm_linux_exec : 
	mkdir -p $@; 
	cd ../lan-monitor-server; \
	GOOS=linux GOARCH=arm go build 
	mv ../lan-monitor-server/lan-monitor-server $@/

clean : clean_binary_builds clean_package_builds clean_package clean_package clean_package_files

clean_binary_builds : 
	rm -rf build_arm_linux_exec
	rm -rf build_x86_64_linux_exec
	rm -rf build_x86_linux_exec

clean_package_builds : 
	rm -rf build_arm_linux_pkg
	rm -rf build_x86_64_linux_pkg
	rm -rf build_x86_linux_pkg

clean_package_files :
	rm -rf $(PACKAGE_DATA_DIR)

clean_package : 
	rm -rf lan-monitor.deb