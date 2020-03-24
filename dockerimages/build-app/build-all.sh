#!/bin/bash

# exit when any command fails
set -e

echo "Cloning"
git clone https://github.com/kruegerrobotics/lan-monitor.git

cd lan-monitor

echo "building the web angular part"
cd webui-ang
npm install --silent

echo "building the go part"
cd ..
cd pkg-build
make -f build-deb-pkg.makefile


