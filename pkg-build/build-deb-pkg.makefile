PACKAGE_NAME=lan-monitor
INSTALL_DIRECTORY=/opt/$PACKAGE_NAME
PACKAGE_DATA_DIR=$(PACKAGE_NAME)/opt/$(PACKAGE_NAME)
HTML_DESTINATION_DIR=$(PACKAGE_DATA_DIR)/www

VERSION=$(shell ./createcontrolfile.py -v)

#for the testing purpose
#requires the vms created and ready
VM_NAME_AMD64=test-amd64
SNAPSHOT_NAME=booted_ip_sshkey

#the default target build all debian packages 
all : build_all_packages

compose_pkg_files : copy_www_files 
		
#moving files to the destination dirs for buidling the package
copy_www_files : 
	mkdir -p ./$(HTML_DESTINATION_DIR)
	cp ../www/index.html ./$(HTML_DESTINATION_DIR)/
	cp -r ../www/css ./$(HTML_DESTINATION_DIR)/
	cp -r ../www/img ./$(HTML_DESTINATION_DIR)/
	cp -r ../www/js ./$(HTML_DESTINATION_DIR)/

build_all_packages : build_i386_linux_pkg build_amd64_linux_pkg build_arm_linux_pkg

build_i386_linux_pkg : copy_www_files build_i386_linux_binary
	mkdir -p $@
	mkdir -p $@/$(PACKAGE_NAME)/opt/$(PACKAGE_NAME)/bin
	cp -r $(PACKAGE_NAME) $@/
	./createcontrolfile.py -a i386 -t control.tmpl -d $@/$(PACKAGE_NAME)/DEBIAN/control
	cp build_i386_linux_binary/lan-monitor-server $@/$(PACKAGE_NAME)/opt/$(PACKAGE_NAME)/bin/
	
	#build the $@ with version $(VERSION)
	fakeroot dpkg --build $@/$(PACKAGE_NAME) $(PACKAGE_NAME)_$(VERSION)_i386.deb

build_amd64_linux_pkg : copy_www_files build_amd64_linux_binary
	mkdir -p $@
	mkdir -p $@/$(PACKAGE_NAME)/opt/$(PACKAGE_NAME)/bin
	cp -r $(PACKAGE_NAME) $@/
	./createcontrolfile.py -a amd64 -t control.tmpl -d $@/$(PACKAGE_NAME)/DEBIAN/control
	cp build_amd64_linux_binary/lan-monitor-server $@/$(PACKAGE_NAME)/opt/$(PACKAGE_NAME)/bin/
	
	#build the $@ with version $(VERSION)
	fakeroot dpkg --build $@/$(PACKAGE_NAME) $(PACKAGE_NAME)_$(VERSION)_amd64.deb

build_arm_linux_pkg : copy_www_files build_arm_linux_binary
	mkdir -p $@
	mkdir -p $@/$(PACKAGE_NAME)/opt/$(PACKAGE_NAME)/bin
	cp -r $(PACKAGE_NAME) $@/
	./createcontrolfile.py -a arm -t control.tmpl -d $@/$(PACKAGE_NAME)/DEBIAN/control
	cp build_arm_linux_binary/lan-monitor-server $@/$(PACKAGE_NAME)/opt/$(PACKAGE_NAME)/bin/
	
	#build the $@ with version $(VERSION)
	fakeroot dpkg --build $@/$(PACKAGE_NAME) $(PACKAGE_NAME)_$(VERSION)_arm.deb

#Building of the webserver binaries
build_all_binaries : build_i386_linux_binary build_x86_64_linux_exec build_arm_linux_exec	

build_i386_linux_binary : 
	mkdir -p $@; 
	cd ../lan-monitor-server; \
	GOOS=linux GOARCH=386 go build -ldflags="-X main.version=$(VERSION)"
	mv ../lan-monitor-server/lan-monitor-server $@/

build_amd64_linux_binary : 
	mkdir -p $@; 
	cd ../lan-monitor-server; \
	GOOS=linux GOARCH=amd64 go build -ldflags="-X main.version=$(VERSION)"
	mv ../lan-monitor-server/lan-monitor-server $@/

build_arm_linux_binary : 
	mkdir -p $@; 
	cd ../lan-monitor-server; \
	GOOS=linux GOARCH=arm go build -ldflags="-X main.version=$(VERSION)"
	mv ../lan-monitor-server/lan-monitor-server $@/

test_amd64_vbox : build_amd64_linux_pkg
	VBoxManage controlvm $(VM_NAME_AMD64) poweroff

	#give the vm mangager some time
	sleep 1

	#restore the old snapshot
	#VBoxManage snapshot $VM_NAME restore $SNAPSHOT_NAME
	VBoxManage snapshot $(VM_NAME_AMD64) restore $(SNAPSHOT_NAME)

	#power on the vm
	VBoxManage startvm $(VM_NAME_AMD64)

	scp $(PACKAGE_NAME)_$(VERSION)_amd64.deb root@192.168.0.175:~/
	ssh root@192.168.0.175 apt-get install nmap -y
	ssh root@192.168.0.175 dpkg -i $(PACKAGE_NAME)_$(VERSION)_amd64.deb
	ssh root@192.168.0.175 systemctl status lan-monitor-server

#cleanup
clean : clean_binary_builds clean_package_builds clean_packages clean_package_files

clean_binary_builds : 
	rm -rf build_arm_linux_binary
	rm -rf build_amd64_linux_binary
	rm -rf build_i386_linux_binary

clean_package_builds : 
	rm -rf build_arm_linux_pkg
	rm -rf build_amd64_linux_pkg
	rm -rf build_i386_linux_pkg

clean_package_files :
	rm -rf $(PACKAGE_DATA_DIR)

clean_packages : 
	rm -rf *.deb