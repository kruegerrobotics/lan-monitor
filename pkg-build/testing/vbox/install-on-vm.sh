#!/bin/bash

VM_NAME="test-amd64"
SNAPSHOT_NAME="booted_ip_sshkey"
PACKAGE_FILE=lan-monitor_1.5.1_amd64.deb

#make sure the machine is off
VBoxManage controlvm $VM_NAME poweroff

#give the vm mangager some time
sleep 1

#restore the old snapshot
#VBoxManage snapshot $VM_NAME restore $SNAPSHOT_NAME
VBoxManage snapshot $VM_NAME restore $SNAPSHOT_NAME

#power on the vm
VBoxManage startvm $VM_NAME

scp ../../$PACKAGE_FILE root@192.168.0.175:~/
ssh root@192.168.0.175 apt-get install nmap -y
ssh root@192.168.0.175 dpkg -i lan-monitor_1.5.1_amd64.deb
ssh root@192.168.0.175 systemctl status lan-monitor-server