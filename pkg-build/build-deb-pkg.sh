#!/bin/sh
chown -R root:root lan-monitor
dpkg-deb --build lan-monitor
chown -R tkrueger:tkrueger lan-monitor