#!/bin/bash

# exit when any command fails
set -e

echo "Cloning"
git clone https://github.com/kruegerrobotics/lan-monitor.git

echo "changing branch"
cd lan-monitor
git checkout ux-upgrade

echo "building the web angular part"
cd webui-ang
npm install

echo "building the go part"
cd ..
cd pkg-build
make -f build-deb-pkg.makefile


