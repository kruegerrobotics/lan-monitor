//globals
let wsServerProdcuction = "ws://" + location.host + "/ws"
let wsServerDebug = "ws://think-deb:8080/ws"
let websocketServer = wsServerProdcuction
let ws
let networkElements
let networkElementsOld

let objs = []
let oldObjs = []

//some stuff for dev&debug
let dummyInjected = true
let dummy = {}
dummy.ip = "192.168.0.111"
dummy.name = "dummy"
dummy.openPorts = ["22"]
dummy.online = true

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
        if (Array.isArray(rowEntries[e]["address"])) {
            tempobj.ip = rowEntries[e]["address"][0]["-addr"]
        } else {
            tempobj.ip = rowEntries[e]["address"]["-addr"]
        }
        tempobj.online = true
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
    if (!dummyInjected) {
        objs.push(dummy)
        dummyInjected = true
    }

    let old = [];
    let act = [];
    for (let i = 0; i < oldObjs.length; i++) {
        old.push(oldObjs[i].ip);
    }
    for (let i = 0; i < objs.length; i++) {
        act.push(objs[i].ip);
    }

    goneOffline = old.filter(function (v) {
        return !act.includes(v);
    })

    for (let j = 0; j < goneOffline.length; j++) {
        for (let i = 0; i < oldObjs.length; i++) {
            if (oldObjs[i].ip === goneOffline[j]) {
                let e = {}
                e.ip = oldObjs[i].ip
                e.name = oldObjs[i].name
                e.openPorts = oldObjs[i].openPorts
                e.online = false
                objs.push(e);
            }
        }
    }
    //sorting required since systems could have gone offline and
    //some others might have appeared new
    objs.sort(function (a, b) {
        return dot2num(a.ip) - dot2num(b.ip)
    })
    createList()
    oldObjs = objs
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
        let content = createEntry(objs[i]["name"], objs[i]["ip"], objs[i]["openPorts"], objs[i]["online"], a)
        computerRow.appendChild(a)
    }
    computers.appendChild(computerContainer)
    computerContainer.appendChild(computerRow)
}

function createEntry(name, ip, ports, online, parentElement) {
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

    if (online) {
        bottom.className = "col-md-12 bg-white text"
        if (ports.length == 0) {
            bottom.innerHTML = "no services detected"
        } else {
            //loop through the ports
            for (let p in ports) {
                switch (ports[p]) {
                    case "22":
                        let s = document.createElement("img")
                        s.className = "img-fluid"
                        s.src = "img/SSH_logo.png"
                        s.style.margin = "5px"
                        s.style.height = "30px"
                        bottom.appendChild(s)
                        break
                    case "80":
                        let h = document.createElement("img")
                        h.className = "img-fluid"
                        h.src = "img/HTTP_logo.png"
                        h.style.margin = "5px"
                        h.style.height = "30px"
                        let a = document.createElement("a")
                        a.href = "http://" + ip
                        a.target = "_blank"
                        a.appendChild(h)
                        bottom.appendChild(a)
                        break
                    default:
                        break
                }
            }
        }
    } else {
        bottom.className = "col-md-12 bg-white text-danger"
        bottom.innerHTML = "went offline"

    }

    bottom.style.borderBottomLeftRadius = borderRadius
    bottom.style.borderBottomRightRadius = borderRadius
    bottom.style.height = "40px"

    entry.appendChild(top)
    entry.appendChild(bottom)
    parentElement.appendChild(entry)
    return entry;
}

//IP address conversion
function dot2num(dot) {
    var d = dot.split('.');
    return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]);
}

// function num2dot(num) {
//     var d = num % 256;
//     for (var i = 3; i > 0; i--) {
//         num = Math.floor(num / 256);
//         d = num % 256 + '.' + d;
//     }
//     return d;
// }
