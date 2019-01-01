//globals
//computer variable array
var networkElements = [];
var networkElementsOld = [];
var Scan_Time = "today";
var Name_Filter_Enabled = true;

//Init function to get the modal ready for closinng
function initModal() {
    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];

    window.onclick = function (event) {
        if (event.target == modal) {
            cleanModal();
            modal.style.display = "none";
        }
    };

    span.onclick = function () {
        cleanModal();
        modal.style.display = "none";
    }
}

function start() {
    initModal();
    readXML("default.xml");
    //readXML("scan.xml");
    setInterval(readXML("scan.xml"), 60 * 1000);
}

function cleanModal() {
    //var modal = document.getElementById("")
    //var modal = document.getElementById("")
    var ports = document.getElementsByClassName("modalPortEntry");
    while (ports.length > 0) {
        ports[0].parentNode.removeChild(ports[0]);
        ports = document.getElementsByClassName("modalPortEntry");
    }
}

function populateModal(Name, IP, Ports) {
    var computerName = document.getElementById("modalComputerName");
    var computerIP = document.getElementById("modalComputerIP");
    var modal = document.getElementById("myModal");
    computerIP.innerHTML = IP;
    if (Name == "") {
        computerName.innerHTML = Name;
    } else {
        computerName.innerHTML = "unknown";
    }

    var portListElement = document.getElementById("modalPortList");

    //list the ports
    for (var p in Ports) {
        var Entry = document.createElement("p");
        Entry.className = "modal-content-ports";
        Entry.innerHTML = p;
        portListElement.appendChild(Entry);
    }

    modal.style.display = "block";
}


function toggleFullNames(element) {
    //if its checked no filter is applied
    if (element.checked) {
        Name_Filter_Enabled = false;
    } else {
        Name_Filter_Enabled = true;
    }
    readXML("scan.xml");
}


function readXML(fileName) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            switch (fileName) {
                case "scan.xml":
                    scan(this);
                    break;
                case "default.xml":
                    scanDefaultList(this);
                    break;
                default:
                    break;
            }
        }
    };
    xhttp.open("GET", fileName, true);
    xhttp.send();
}

//Scans the default list if available and (pre) populates the Computer list
function scanDefaultList(xml) {
    var xmlDoc = xml.responseXML;
    var defaultComputers = xmlDoc.getElementsByTagName("networkelement");

    for (let i = 0; i < defaultComputers.length; i++) {
        let hostName = defaultComputers[i].getAttribute("name");
        let ip = defaultComputers[i].getAttribute("ip");
        let ports = defaultComputers[i].getAttribute("ports");
        networkElementsOld.push(new NetworkElement(ip, hostName, ports, false, false));
    }
}

//save the current computer list to xml file which is offered to the user
//Computers which are currently offline will be not part of this list
function saveDefaultList() {
    var xmlDoc = document.implementation.createDocument("", "", null);
    var root = xmlDoc.createElement("defaultList");
    var Is_List_Populated = false;
    for (var i in networkElements) {
        if (networkElements[i].goneOffline == false) {
            var Entry = xmlDoc.createElement("networkelement");
            Entry.setAttribute("ip", networkElements[i].ip);
            Entry.setAttribute("name", networkElements[i].computerName);
            Entry.setAttribute("ports", networkElements[i].portList);
            root.appendChild(Entry);
            Is_List_Populated = true;
        }
    }
    if (Is_List_Populated == true) {
        xmlDoc.appendChild(root);
        let fileContent = (new XMLSerializer()).serializeToString(xmlDoc);
        var XML_for_Download = document.createElement('a');
        XML_for_Download.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContent));
        XML_for_Download.setAttribute('download', "default.xml");
        XML_for_Download.click();
    }
}

//Filters the hostname or shows the full Domain name if not filtered
function filterHostname(Host_Name, Apply_Filter = true) {
    if (Apply_Filter == false) {
        return Host_Name;
    } else {
        var s = Host_Name.split(".");
        return s[0];
    }
}

function scan(xml) {
    //the general xml handler
    var xmlDoc = xml.responseXML;

    //write down the scan time
    Scan_Time = xmlDoc.getElementsByTagName("nmaprun")[0].getAttribute("startstr");
    var Num_Hosts = xmlDoc.getElementsByTagName("host").length;

    //clean the old list
    for (let i = networkElements.length - 1; i >= 0; i--) {
        networkElements[i].removeElement();
        networkElements.splice(i, 1);
    }

    //looping throught the xml entries
    for (var i = 0; i < Num_Hosts; i++) {
        var hostElement = xmlDoc.getElementsByTagName("host")[i];
        var ip = hostElement.getElementsByTagName("address")[0].getAttribute("addr");
        var hostNameElement = hostElement.getElementsByTagName("hostnames")[0].getElementsByTagName("hostname")[0];
        let hostname = " "

        if (hostNameElement) {
            hostName = hostNameElement.getAttribute("name");
            hostName = filterHostname(hostName, Name_Filter_Enabled);
        } else {
            hostName = "Unknown";
        }

        let ports = [];
        var portsElement = hostElement.getElementsByTagName("ports")[0].getElementsByTagName("port");
        for (let j = 0; j < portsElement.length; j++) {
            let portID = portsElement[j].getAttribute("portid");
            let portStatus = portsElement[j].getElementsByTagName("state")[0].getAttribute("state")
            if (portStatus == "open") {
                ports.push(portID);
            }
        }
        networkElements.push(new NetworkElement(ip, hostName, ports));
    }

    //find the elements that have not been here
    let old = [];
    let act = [];
    for (let i = 0; i < networkElementsOld.length; i++) {
        old.push(networkElementsOld[i].ip);
    }
    for (let i = 0; i < networkElements.length; i++) {
        act.push(networkElements[i].ip);
    }

    goneOffline = old.filter(function (v) {
        return !act.includes(v);
    })

    for (let j = 0; j < goneOffline.length; j++) {
        for (let i = 0; i < networkElementsOld.length; i++) {
            if (networkElementsOld[i].ip === goneOffline[j]) {
                e = new NetworkElement(networkElementsOld[i].ip, networkElementsOld[i].computerName, networkElementsOld[i].portList, true);
                networkElements.push(e);
            }
        }
    }

    networkElements.sort(function (a, b) {
        return dot2num(a.ip) - dot2num(b.ip);
    });
    console.log(networkElements);
    console.log(networkElementsOld);
    networkElementsOld = networkElements.slice();
}

function removeOldElements() {
    var r2 = document.getElementById("parent");
    if (r2) {
        r2.parentNode.removeChild(r2);
    }
}

//IP address conversion
function dot2num(dot) {
    var d = dot.split('.');
    return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]);
}

function num2dot(num) {
    var d = num % 256;
    for (var i = 3; i > 0; i--) {
        num = Math.floor(num / 256);
        d = num % 256 + '.' + d;
    }
    return d;
}
