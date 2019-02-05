#!/bin/bash
# exit when any command fails
set -e

echo "Cloning"
git clone https://github.com/kruegerrobotics/lan-monitor.git

echo "building"
cd lan-monitor/pkg-build
make -f build-deb-pkg.makefile


