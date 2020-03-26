
# Installation

## Installation by using the provided Debian package

If running on Debian or a deb base package manager you can use the debian packages provided [here](https://github.com/KruDex/lan-monitor/releases/latest).

#### WARNINGS for debian package

It automatically starts a webserver on port 8080. In case another application is using this port it will fail starting or prevents the other application from start. The port can be configured either in the config file. By default the config file will be /etc/lan-monitor.json.

#### Installation procedure

This package requires nmap you can install it by typing:

```bash
apt install nmap
```

Installation of the package

```bash
dpkg -i lan-monitor.deb
```

If nmap is not installed apt will complain and the missing package. It can be installed by typing:

```bash
apt-get install -f
```

### Manual installation (stand alone folders)

To install the required components and the configuration of the webserver can also be done manually. This is recommended if there are is already a webserver is in use and/or for greater control of the system.

#### Files for the website

The files to display the website are in the www folder of this repository. The scan.xml from the NMAP scan results needs to be in the same location as the index.html.

#### Webserver executable

The executable, managing the periodic scan and serving the webpages is a go executable. It expects the website in a path *../www relative* to it. Later this should be configurable via a config file.

#### NMAP installation

The source file for the parsing is build on a nmap scan result in xml format. On Debian it can be installed by

```bash
apt get install nmap
```

### Test the installation

If you enter not the ip address or the computer name in the browser it should display the computers in the lan e.g. (http://192.168.1.2:8080) on the computer itself (http://127.0.01:8080). It can take a few minutes until the first nmap scan is completed. There should be the file scan.xml in the */var/opt/lan-monitor* folder.
