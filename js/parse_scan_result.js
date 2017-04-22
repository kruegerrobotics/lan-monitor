function Read_XML() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            Scan(this);
        }
    };
    xhttp.open("GET", "scan.xml", true);
    xhttp.send();
}

//global array
var Computers = [];
var IPs = [];

function Scan(xml) {
    //the general xml handler
    var xmlDoc = xml.responseXML;

    //write down the scan time
    var Scan_Time = xmlDoc.getElementsByTagName("nmaprun")[0].getAttribute("startstr");
    var Scan_Time_Headline = document.createElement("h1");
    Scan_Time_Headline.innerHTML = "Scan time: " + Scan_Time;
    document.body.appendChild(Scan_Time_Headline);

    var Num_Hosts = xmlDoc.getElementsByTagName("host").length;

    for (var i = 0; i < Num_Hosts; i++) {
        var Host_Element = xmlDoc.getElementsByTagName("host")[i];
        var IP_Address = Host_Element.getElementsByTagName("address")[0].getAttribute("addr");
        var Hostname_Element = Host_Element.getElementsByTagName("hostnames")[0].getElementsByTagName("hostname")[0];
        if (Hostname_Element) {
            var Hostname = Hostname_Element.getAttribute("name");
            var s = Hostname.split(".");
            Hostname = s[0];
        } else {
            var Hostname = "Unknown";
        }

        var Ports_Element = Host_Element.getElementsByTagName("ports")[0].getElementsByTagName("port");
        for (var j = 0; j < Ports_Element.length; j++) {
            var Port_ID = Ports_Element[j].getAttribute("portid");
            var Port_Status = Ports_Element[j].getElementsByTagName("state")[0].getAttribute("state");
            //console.log("Name: " + Hostname + " Portid: " + Port_ID + " status: " + Port_Status);
        }
        var SSH_State = Ports_Element[0].getElementsByTagName("state")[0].getAttribute("state");
        var HTTP_State = Ports_Element[1].getElementsByTagName("state")[0].getAttribute("state");

        //add all to main array
        var Computer = {
            "Hostname": Hostname,
            "IP": IP_Address,
            "SSH": SSH_State,
            "HTTP": HTTP_State
        };
        IPs.push(IP_Address)
        Computers.push(Computer);
    } //end for loop
    //var IP_Address = xmlDoc.getElementsByTagName("nmaprun")[0].childNodes[0].nodeName;
    Computers.sort(function(a, b) {
        return dot2num(a.IP) - dot2num(b.IP);
    });
    Display()
}

function Display() {
    //preparations for the page design
    var parent_div = document.createElement("div")
    parent_div.id = "parent"
    document.body.appendChild(parent_div);

    var Num_Hosts = Computers.length;

    for (var i in Computers) {
        var child_input = document.createElement("div");
        child_input.className = "Computer_Entry";
        child_input.id = "child" + i.toString();
        var Elem_IP = document.createElement("p");
        Elem_IP.innerHTML = "IP: " + Computers[i].IP;
        var Elem_Name = document.createElement("p");
        Elem_Name.innerHTML = "Name: " + Computers[i].Hostname;

        document.getElementById(parent_div.id).appendChild(child_input);
        document.getElementById(child_input.id).appendChild(Elem_IP);
        document.getElementById(child_input.id).appendChild(Elem_Name);

        if (Computers[i].SSH == "open") {
            Elem_SSH_Img = document.createElement("img");
            Elem_SSH_Img.src = "img/SSH_logo.png";
            Elem_SSH_Img.id = "port_logo";
            //Elem_SSH_Img.style = "width:80px;margin:10px";
            document.getElementById(child_input.id).appendChild(Elem_SSH_Img);
        }

        if (Computers[i].HTTP == "open") {
            Elem_HTTP_Img = document.createElement("img");
            Elem_HTTP_Img.src = "img/HTTP_logo.png";
            Elem_HTTP_Img.id = "port_logo";
            //Elem_HTTP_Img.style = "width:80px";
            document.getElementById(child_input.id).appendChild(Elem_HTTP_Img);
        }
    } //end for loop
} //end function Display

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
