#!/bin/bash
# exit when any command fails
set -e

echo "Cloning"
git clone https://github.com/kruegerrobotics/lan-monitor.git

echo "building the web angular part"
cd
cd lan-monitor/webui-ang
npm install

echo "building the go part"
cd
cd lan-monitor/pkg-build
make -f build-deb-pkg.makefile


