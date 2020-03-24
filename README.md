# lan-monitor

## Dowload here [github-release](https://github.com/KruDex/lan-monitor/releases/latest)

**This are older releases and currently the updates describride below will be available as version v3.0.0 and higher**

## What it does

This software builds a dynamic graphical website showing the results of a NMAP scan. This tool has an integrated webserver to display this website with the hostnames, IP addresses and selected open ports.

![alt text](documentation/computer_list_offline.png "Impression of the scan result as website")

## Ideas and intentions

## Scanning local area networks

It was the original intend to get a quick overview of local laboratory or home networks. For the user to see immideately the status of the computers connected. Basically important open ports (ssh, http) and also if a computers have been switched off. The visualisation is a  website accessible by everybody inside independend of used OS. This was everyone can see the real time network status e.g.  to see if a certain device is online and accessible. In our lab with a lot of embedded devices this is very practical without pinging and looking up names or ip addresses.

### Scanning public IP-addresses

From some interactions I learned that this could be also of interest. I would be happy to learn with features might be interesting here. e.g. scan more ports, display them, nmap --top-ports, ... **just raise an issue and we can work on it together**

## Features

- Easy to understand graphical representation
- Shows the hostname and IP address
- Shows if the computer is running a webserver with clickable link (not available right now)
- Shows is the computer is accessible via SSH
- Shows if a computer has gone offline
- the scan parameters can be configure via the web interfaces

## How it works

It is based on a periodically executed nmap scan. The result of this scan, a xml file, is transformed to JSON and the server hosting the websites visualisiation will sent the result of each scan to the connected clients via websockets.

## Usage

The benefit for the user is to have an overview of the network. She sees which systems are online with which ports open. In addtion there is information if a system has gone offline. Howeber this is specific to the **current client and its local stored list**. For illustration if client A is online since 8:00 am and one computer that was in its list is switched off at 8:30 am it will display it as *offline*. If another client (client B) is swichted on at 10:00 am it will not see this machine at all. Especially not marked as offline since it never new that is was online before.

### Delete current stored list

The client can delete the indivitually stored list by clicking on the trash bin button at the top.

### Configure the scan

The client can send the server a message with which parameters and/or which IP addressses nmap should scan. The next time the server scans this will be updated. **Warning** this will affect all clients connected to that server.

### Architecture

The figure below shows in brief the components of the system. ![alt text](documentation/architecture.png "Impression of the scan result as website")

#### lan-monitor-server

This go program triggers the nmap scan and host the pages for the web ui. After each scan it sends the results to its clients.

#### Client: webui-ang

This is the website for the user interaction. It is hosted on the server and retrieves updates on the scans via websocktes. It is written with the Angular framework.

## Installation

### Installation by using the provided Debian package

If running on Debian or a deb base package manager you can use the debian packages provided [here](https://github.com/KruDex/lan-monitor/releases/latest).

#### WARNINGS for debian package

It automatically starts a webserver on port 8080. In case another application is using this port it will fail starting or prevents the other application from start. The port can be configured either in the config file */etc/lan-monitor.conf* or using the commandline option.

##### Not everything is automatic or configurable by the web interface (yet)

The ip range or adresses that are planned to scan are either set in the config file  */etc/lan-monitor.conf* or command line option.

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
