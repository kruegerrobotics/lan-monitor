//globals
let wsServerProdcuction = "ws://" + location.host + "/ws"
let wsServerDebug = "ws://think-deb:8080/ws"
let websocketServer = wsServerDebug
let ws
let networkElements
let networkElementsOld

let objs = []

ws = new WebSocket(websocketServer)

ws.onopen = function (event) {
    msg = { Commmand: "request" }
    ws.send(JSON.stringify(msg))
}

ws.onerror = function (event) {
    console.log("ws error")
    activateErrorState()
}

ws.onclose = function (event) {
    console.log("ws closed")
    activateErrorState()
}

ws.onmessage = function (event) {
    objs = []
    let data = JSON.parse(event.data)

    //update the title
    let navBarTitle = document.getElementById("navbar_title")
    let navBatSubTitle = document.getElementById("navbar_subtitle")
    let args = data["nmaprun"]["-args"]
    let startStr = data["nmaprun"]["-startstr"]
    navBarTitle.innerHTML = "NMAP scan: " + startStr
    navBatSubTitle.innerHTML = "args: " + args

    //preparing to update the list
    networkElementsOld = networkElements
    rowEntries = data["nmaprun"]["host"]

    let rowElements = document.getElementById("rowEntries")

    if (rowElements) {
        rowElements.parentNode.removeChild(rowElements);
    }

    for (let e in rowEntries) {
        //console.log(rowEntries[e])
        var tempobj = {}
        tempobj.ip = rowEntries[e]["address"]["-addr"]

        if (rowEntries[e]["hostnames"]) {
            tempobj.name = rowEntries[e]["hostnames"]["hostname"]["-name"]
        } else {
            tempobj.name = "unknown"
        }
        let tempPorts = rowEntries[e]["ports"]["port"]
        let ports = []
        for (let p in tempPorts) {
            let port = tempPorts[p]["-portid"]
            let protocol = tempPorts[p]["-protocol"]
            let state = tempPorts[p]["state"]["-state"]

            if (state == "open") {
                ports.push(port)
            }
            //ports.push({"port" : port, "protocol" : protocol})
        }
        tempobj.openPorts = ports
        //console.log(rowEntries[e]["address"]["-addr"])
        //console.log(rrowEntries[e]["address"]["-addr"])
        objs.push(tempobj)
    }

    createList()
}

function activateErrorState() {
    let navBarTitle = document.getElementById("navbar_title")
    let navBatSubTitle = document.getElementById("navbar_subtitle")

    //clear site and show warning
    delAll()
    navBarTitle.innerHTML = "ERROR connecting to server"
    navBarTitle.className = "text-danger col-12"
    navBatSubTitle.innerHTML = "refresh browser / check server"
    navBatSubTitle.className = "text-warning col-12"
}

function delAll() {
    let row = document.getElementById("rowEntries")
    if (row) {
        row.parentNode.removeChild(row)
    }
}

function createList() {
    let computers = document.getElementById("computers")
    let computerContainer = document.createElement("div")
    computerContainer.className = "container"
    let computerRow = document.createElement("div")
    computerRow.className = "row"
    computerRow.id = "rowEntries"
    for (let i = 0; i < objs.length; i++) {
        let a = document.createElement("div")
        a.className = "col-lg-4 form-group"
        let content = createEntry(objs[i]["name"], objs[i]["ip"], objs[i]["openPorts"], a)
        computerRow.appendChild(a)
    }
    computers.appendChild(computerContainer)
    computerContainer.appendChild(computerRow)
}

function removeList() {
    console.log("removing list")
}

// function createEntry(name, ip, ports, parentElement) {
//     let entry = document.createElement("div")
//     //add the information bar and its memebers
//     let information = document.createElement("div");
//     information.className = "row";
//     entry.appendChild(information);

//     let ipText = document.createElement("p");
//     ipText.className = "col-sm-6"
//     information.appendChild(ipText);
//     ipText.innerHTML = "IP: " + ip;

//     let computerText = document.createElement("p");
//     computerText.className = "col-sm-6"
//     information.appendChild(computerText);
//     computerText.innerHTML = "Name: " + name;

//     //add the payload and its members 
//     let payload = document.createElement("div");
//     payload.className = "col-sm-12 bg-dark";
//     entry.appendChild(payload);

//     let serviceText = document.createElement("p");
//     serviceText.className = "Service_Text";

//     if (this.goneOffline) {
//         serviceText.className = "Service_Text_Offline";
//         serviceText.innerHTML = "System offline";
//         information.className = "Information_Bar_Offline";
//         payload.appendChild(serviceText);
//         return;
//     }


//     if (ports.length == 0) {
//         serviceText.innerHTML = "No services available";
//         payload.appendChild(serviceText);
//     }
//     else {
//         //all the ports
//         for (let i = 0; i < ports.length; i++) {

//             switch (ports[i]) {
//                 case "22":
//                     let sshLogo = document.createElement("img");
//                     sshLogo.id = "port_logo";
//                     sshLogo.src = "img/SSH_logo.png";
//                     payload.appendChild(sshLogo);
//                     break;
//                 case "80":
//                     let httpLink = document.createElement("a");
//                     httpLink.href = "http://" + ip;
//                     httpLink.target = "_blank";
//                     payload.appendChild(httpLink);

//                     let httpLogo = document.createElement("img");
//                     httpLogo.src = "img/HTTP_logo.png";
//                     httpLogo.id = "port_logo";
//                     httpLink.appendChild(httpLogo);
//                     break;
//                 default:
//                     let otherPortContainer = document.createElement("div");
//                     otherPortContainer.innerText = portList[i];
//                     payload.appendChild(otherPortContainer);
//             }
//         }
//     }
//     parentElement.appendChild(entry)
//     return entry;
// }

function createEntry(name, ip, ports, parentElement) {
    let entry = document.createElement("div")

    let borderRadius = "5px"

    let top = document.createElement("div")
    top.className = "bg-dark text-success"
    top.style.borderTopLeftRadius = borderRadius
    top.style.borderTopRightRadius = borderRadius

    let topRow = document.createElement("div")
    topRow.className = "row col-md-12"

    let nameElement = document.createElement("div")
    nameElement.innerHTML = "Name: " + name
    nameElement.className = "col-md-6 text-truncate"

    let ipElement = document.createElement("div")
    ipElement.innerHTML = "IP: " + ip
    ipElement.className = "col-md-6"

    top.appendChild(topRow)
    topRow.appendChild(nameElement)
    topRow.appendChild(ipElement)

    let bottom = document.createElement("div")
    bottom.className = "col-md-12 bg-white"
    bottom.innerHTML = ports
    bottom.style.borderBottomLeftRadius = borderRadius
    bottom.style.borderBottomRightRadius = borderRadius

    entry.appendChild(top)
    entry.appendChild(bottom)
    parentElement.appendChild(entry)
    return entry;
}

//below here is the old content
// //globals
// //computer variable array
// var networkElements = [];
// var networkElementsOld = [];
// var Scan_Time = "today";
// var Name_Filter_Enabled = true;

// //Init function to get the modal ready for closinng
// function initModal() {
//     var modal = document.getElementById("myModal");
//     var span = document.getElementsByClassName("close")[0];

//     window.onclick = function (event) {
//         if (event.target == modal) {
//             cleanModal();
//             modal.style.display = "none";
//         }
//     };

//     span.onclick = function () {
//         cleanModal();
//         modal.style.display = "none";
//     }
// }

// function start() {
//     initModal();
//     readXML("default.xml");
//     //readXML("scan.xml");
//     setInterval(readXML("scan.xml"), 60 * 1000);
// }

// function cleanModal() {
//     //var modal = document.getElementById("")
//     //var modal = document.getElementById("")
//     var ports = document.getElementsByClassName("modalPortEntry");
//     while (ports.length > 0) {
//         ports[0].parentNode.removeChild(ports[0]);
//         ports = document.getElementsByClassName("modalPortEntry");
//     }
// }

// function populateModal(Name, IP, Ports) {
//     var computerName = document.getElementById("modalComputerName");
//     var computerIP = document.getElementById("modalComputerIP");
//     var modal = document.getElementById("myModal");
//     computerIP.innerHTML = IP;
//     if (Name == "") {
//         computerName.innerHTML = Name;
//     } else {
//         computerName.innerHTML = "unknown";
//     }

//     var portListElement = document.getElementById("modalPortList");

//     //list the ports
//     for (var p in Ports) {
//         var Entry = document.createElement("p");
//         Entry.className = "modal-content-ports";
//         Entry.innerHTML = p;
//         portListElement.appendChild(Entry);
//     }

//     modal.style.display = "block";
// }


// function toggleFullNames(element) {
//     //if its checked no filter is applied
//     if (element.checked) {
//         Name_Filter_Enabled = false;
//     } else {
//         Name_Filter_Enabled = true;
//     }
//     readXML("scan.xml");
// }


// function readXML(fileName) {
//     var xhttp = new XMLHttpRequest();
//     xhttp.onreadystatechange = function () {
//         if (this.readyState == 4 && this.status == 200) {
//             switch (fileName) {
//                 case "scan.xml":
//                     scan(this);
//                     break;
//                 case "default.xml":
//                     scanDefaultList(this);
//                     break;
//                 default:
//                     break;
//             }
//         }
//     }
//     xhttp.open("GET", fileName, true);
//     xhttp.send();
// }

// //Scans the default list if available and (pre) populates the Computer list
// function scanDefaultList(xml) {
//     var xmlDoc = xml.responseXML;
//     var defaultComputers = xmlDoc.getElementsByTagName("networkelement");

//     for (let i = 0; i < defaultComputers.length; i++) {
//         let hostName = defaultComputers[i].getAttribute("name");
//         let ip = defaultComputers[i].getAttribute("ip");
//         let ports = defaultComputers[i].getAttribute("ports");
//         networkElementsOld.push(new NetworkElement(ip, hostName, ports, false, false));
//     }
// }

// //save the current computer list to xml file which is offered to the user
// //Computers which are currently offline will be not part of this list
// function saveDefaultList() {
//     var xmlDoc = document.implementation.createDocument("", "", null);
//     var root = xmlDoc.createElement("defaultList");
//     var Is_List_Populated = false;
//     for (var i in networkElements) {
//         if (networkElements[i].goneOffline == false) {
//             var Entry = xmlDoc.createElement("networkelement");
//             Entry.setAttribute("ip", networkElements[i].ip);
//             Entry.setAttribute("name", networkElements[i].computerName);
//             Entry.setAttribute("ports", networkElements[i].portList);
//             root.appendChild(Entry);
//             Is_List_Populated = true;
//         }
//     }
//     if (Is_List_Populated == true) {
//         xmlDoc.appendChild(root);
//         let fileContent = (new XMLSerializer()).serializeToString(xmlDoc);
//         var XML_for_Download = document.createElement('a');
//         XML_for_Download.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContent));
//         XML_for_Download.setAttribute('download', "default.xml");
//         XML_for_Download.click();
//     }
// }

// //Filters the hostname or shows the full Domain name if not filtered
// function filterHostname(Host_Name, Apply_Filter = true) {
//     if (Apply_Filter == false) {
//         return Host_Name;
//     } else {
//         var s = Host_Name.split(".");
//         return s[0];
//     }
// }

// function scan(xml) {
//     //the general xml handler
//     var xmlDoc = xml.responseXML;

//     //write down the scan time
//     Scan_Time = xmlDoc.getElementsByTagName("nmaprun")[0].getAttribute("startstr");
//     var Num_Hosts = xmlDoc.getElementsByTagName("host").length;

//     //clean the old list
//     for (let i = networkElements.length - 1; i >= 0; i--) {
//         networkElements[i].removeElement();
//         networkElements.splice(i, 1);
//     }

//     //looping throught the xml entries
//     for (var i = 0; i < Num_Hosts; i++) {
//         var hostElement = xmlDoc.getElementsByTagName("host")[i];
//         var ip = hostElement.getElementsByTagName("address")[0].getAttribute("addr");
//         var hostNameElement = hostElement.getElementsByTagName("hostnames")[0].getElementsByTagName("hostname")[0];
//         let hostname = " "

//         if (hostNameElement) {
//             hostName = hostNameElement.getAttribute("name");
//             hostName = filterHostname(hostName, Name_Filter_Enabled);
//         } else {
//             hostName = "Unknown";
//         }

//         let ports = [];
//         var portsElement = hostElement.getElementsByTagName("ports")[0].getElementsByTagName("port");
//         for (let j = 0; j < portsElement.length; j++) {
//             let portID = portsElement[j].getAttribute("portid");
//             let portStatus = portsElement[j].getElementsByTagName("state")[0].getAttribute("state")
//             if (portStatus == "open") {
//                 ports.push(portID);
//             }
//         }
//         networkElements.push(new NetworkElement(ip, hostName, ports));
//     }

//     //find the elements that have not been here
//     let old = [];
//     let act = [];
//     for (let i = 0; i < networkElementsOld.length; i++) {
//         old.push(networkElementsOld[i].ip);
//     }
//     for (let i = 0; i < networkElements.length; i++) {
//         act.push(networkElements[i].ip);
//     }

//     goneOffline = old.filter(function (v) {
//         return !act.includes(v);
//     })

//     for (let j = 0; j < goneOffline.length; j++) {
//         for (let i = 0; i < networkElementsOld.length; i++) {
//             if (networkElementsOld[i].ip === goneOffline[j]) {
//                 e = new NetworkElement(networkElementsOld[i].ip, networkElementsOld[i].computerName, networkElementsOld[i].portList, true);
//                 networkElements.push(e);
//             }
//         }
//     }

//     networkElements.sort(function (a, b) {
//         return dot2num(a.ip) - dot2num(b.ip);
//     });
//     //    console.log(networkElements);
//     //    console.log(networkElementsOld);
//     networkElementsOld = networkElements.slice();
// }

// function removeOldElements() {
//     var r2 = document.getElementById("parent");
//     if (r2) {
//         r2.parentNode.removeChild(r2);
//     }
// }

// //IP address conversion
// function dot2num(dot) {
//     var d = dot.split('.');
//     return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]);
// }

// function num2dot(num) {
//     var d = num % 256;
//     for (var i = 3; i > 0; i--) {
//         num = Math.floor(num / 256);
//         d = num % 256 + '.' + d;
//     }
//     return d;
// }
