#!/bin/bash

wget https://github.com/kruegerrobotics/lan-monitor/releases/download/v3.0.0/lan-monitor_v3.0.0_amd64.deb
dpkg -i lan-monitor_v3.0.0_amd64.deb

cd /opt/lan-monitor/bin
./lan-monitor-server