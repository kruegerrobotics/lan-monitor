SHELL=/bin/bash
PACKAGE_NAME=lan-monitor
INSTALL_DIRECTORY=/opt/$PACKAGE_NAME
PACKAGE_DATA_DIR=$(PACKAGE_NAME)/opt/$(PACKAGE_NAME)
HTML_DESTINATION_DIR=$(PACKAGE_DATA_DIR)/www

VERSION=$(shell git describe)

#for the testing purpose
#requires the vms created and ready
VM_NAME_AMD64=test-amd64
SNAPSHOT_NAME=booted_ip_sshkey_upgr1

#the default target build all debian packages 
all : build_all_packages build_all_stand_alones

compose_pkg_files : copy_www_files 

#build the webcomponent
build_webui :
	cd ../webui-ang 
	ng build --prod
	
#moving files to the destination dirs for buidling the package
copy_www_files : 
	mkdir -p ./$(HTML_DESTINATION_DIR)
	cp -r ../webui-ang/dist/lan-mon-ang/* ./$(HTML_DESTINATION_DIR)/

build_all_stand_alones : lan-monitor_i386_linux_std_alone lan-monitor_amd64_linux_std_alone lan-monitor_armhf_linux_std_alone

build_all_packages : build_i386_linux_pkg build_amd64_linux_pkg build_armhf_linux_pkg

#build stand alones (executable and webdir)
lan-monitor_i386_linux_std_alone : copy_www_files build_i386_linux_binary 
	mkdir -p $@/www
	mkdir -p $@/bin
	cp build_i386_linux_binary/* $@/bin/
	cp -r $(HTML_DESTINATION_DIR)/* $@/www/
	tar -czvf $@.tar.gz  $@

lan-monitor_amd64_linux_std_alone : copy_www_files build_amd64_linux_binary
	mkdir -p $@/www
	mkdir -p $@/bin
	cp build_amd64_linux_binary/* $@/bin/
	cp -r $(HTML_DESTINATION_DIR)/* $@/www/
	tar -czvf $@.tar.gz  $@

lan-monitor_armhf_linux_std_alone : copy_www_files build_armhf_linux_binary
	mkdir -p $@/www
	mkdir -p $@/bin
	cp build_armhf_linux_binary/* $@/bin/
	cp -r $(HTML_DESTINATION_DIR)/* $@/www/
	tar -czvf $@.tar.gz  $@

#build the debian packages
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
	#source deactivate

build_armhf_linux_pkg : copy_www_files build_armhf_linux_binary
	mkdir -p $@
	mkdir -p $@/$(PACKAGE_NAME)/opt/$(PACKAGE_NAME)/bin
	cp -r $(PACKAGE_NAME) $@/
	./createcontrolfile.py -a armhf -t control.tmpl -d $@/$(PACKAGE_NAME)/DEBIAN/control
	cp build_armhf_linux_binary/lan-monitor-server $@/$(PACKAGE_NAME)/opt/$(PACKAGE_NAME)/bin/
	
	#build the $@ with version $(VERSION)
	fakeroot dpkg --build $@/$(PACKAGE_NAME) $(PACKAGE_NAME)_$(VERSION)_armhf.deb

#Building of the webserver binaries
build_all_binaries : build_i386_linux_binary build_x86_64_linux_exec build_armhf_linux_exec	

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
	
build_armhf_linux_binary : 
	mkdir -p $@; 
	cd ../lan-monitor-server; \
	GOOS=linux GOARCH=arm go build -ldflags="-X main.version=$(VERSION)"
	mv ../lan-monitor-server/lan-monitor-server $@/

test_amd64_vbox : build_amd64_linux_pkg
	#VBoxManage showvminfo $(VM_NAME_AMD64) | grep -c "running (since" && VBoxManage controlvm $(VM_NAME_AMD64) poweroff; \

	#give the vm mangager some time
	sleep 1

	#restore the old snapshot
	VBoxManage snapshot $(VM_NAME_AMD64) restore $(SNAPSHOT_NAME)

	#power on the vm
	VBoxManage startvm $(VM_NAME_AMD64)
	
	#give some more time
	sleep 2

	scp $(PACKAGE_NAME)_$(VERSION)_amd64.deb root@192.168.0.175:~/
	ssh root@192.168.0.175 apt install nmap -y
	ssh root@192.168.0.175 dpkg -i $(PACKAGE_NAME)_$(VERSION)_amd64.deb
	ssh root@192.168.0.175 systemctl status lan-monitor-server

#cleanup
clean : clean_binary_builds clean_package_builds clean_packages clean_package_files clean_stand_alone_builds clean_tarballs

clean_stand_alone_builds :
	rm -rf lan-monitor_i386_linux_std_alone
	rm -rf lan-monitor_amd64_linux_std_alone
	rm -rf lan-monitor_armhf_linux_std_alone

clean_binary_builds : 
	rm -rf build_armhf_linux_binary
	rm -rf build_amd64_linux_binary
	rm -rf build_i386_linux_binary

clean_package_builds : 
	rm -rf build_armhf_linux_pkg
	rm -rf build_amd64_linux_pkg
	rm -rf build_i386_linux_pkg

clean_package_files :
	rm -rf $(PACKAGE_DATA_DIR)

clean_packages : 
	rm -rf *.deb

clean_tarballs :
	rm -rf *.tar.gz
