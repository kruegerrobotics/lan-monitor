//global variable array
var Computers = [];
var Scan_Time = "today";

function Start() {
    Parse_Defaulf_List();
    Read_XML();
    setInterval(Read_XML, 60 * 1000);
}

function Read_XML() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            Scan(this);
        }
    };
    xhttp.open("GET", "scan.xml", true);
    xhttp.send();
}

function Parse_Defaulf_List() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            Scan_Default_List(this);
        }
    };
    xhttp.open("GET", "default.xml", true);
    xhttp.send();
}

//Scans the default list if available and (pre) populates the Computer list
function Scan_Default_List(xml) {
    var xmlDoc = xml.responseXML;

    var Default_Computers = xmlDoc.getElementsByTagName("Computer");
    var Num_Default_Computers = Default_Computers.length;

    for (var i = 0; i < Num_Default_Computers; i++) {

        var Computer = {
            "Hostname": Default_Computers[i].getAttribute("name"),
            "IP": Default_Computers[i].getAttribute("ip"),
            "SSH": Default_Computers[i].getAttribute("ssh"),
            "HTTP": Default_Computers[i].getAttribute("http"),
            "Deactivated": false
        };
        Computers.push(Computer);
    }

}

//save the current computer list to xml file which is offered to the user
//Computers which are currently offline will be not part of this list
function Save_Default_List() {
    var xmlDoc = document.implementation.createDocument("", "", null);
    var root = xmlDoc.createElement("Default_Computers");
    var Is_List_Populated = false;

    for (var i in Computers) {
        if (Computers[i].Deactivated == false) {
            var Entry = xmlDoc.createElement("Computer");
            Entry.setAttribute("ip", Computers[i].IP);
            Entry.setAttribute("name", Computers[i].Hostname);
            Entry.setAttribute("ssh", Computers[i].SSH);
            Entry.setAttribute("http", Computers[i].HTTP);
            root.appendChild(Entry);
            Is_List_Populated = true;
        }
    }
    if (Is_List_Populated == true) {
        xmlDoc.appendChild(root);

        File_Content = (new XMLSerializer()).serializeToString(xmlDoc);
        var XML_for_Download = document.createElement('a');
        XML_for_Download.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(File_Content));
        XML_for_Download.setAttribute('download', "default.xml");
        XML_for_Download.click();
    }
}

function Scan(xml) {
    //the general xml handler
    var xmlDoc = xml.responseXML;

    //write down the scan time
    Scan_Time = xmlDoc.getElementsByTagName("nmaprun")[0].getAttribute("startstr");
    var Num_Hosts = xmlDoc.getElementsByTagName("host").length;
    var Computers_New = [];
    //looping throught the xml entries
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
        }
        var SSH_State = Ports_Element[0].getElementsByTagName("state")[0].getAttribute("state");
        var HTTP_State = Ports_Element[1].getElementsByTagName("state")[0].getAttribute("state");

        //add all to main array
        var Computer = {
            "Hostname": Hostname,
            "IP": IP_Address,
            "SSH": SSH_State,
            "HTTP": HTTP_State,
            "Deactivated": false
        };
        Computers_New.push(Computer);
    } //end for loop

    //check for lost/deactivated computers (they should be displayed grayed out)
    var missed = false;
    for (var old_c in Computers) {
        var Computer_Counter = 0;
        for (var new_c in Computers_New) {

            if (Computers_New[new_c].IP == Computers[old_c].IP) {
                //we found the same IP so we can move on
                missed = false;
                break;
            }
            Computer_Counter++;
            if (Computer_Counter == Computers_New.length) {
                //The computer is not here - we looking in the complete array
                var Missing_Computer = {
                    "Hostname": Computers[old_c].Hostname,
                    "IP": Computers[old_c].IP,
                    "SSH": Computers[old_c].SHH,
                    "HTTP": Computers[old_c].HTTP,
                    "Deactivated": true
                };
                missed = true;
                Computers_New.push(Missing_Computer);
            }
        }

    }
    Computers_New.sort(function (a, b) {
        return dot2num(a.IP) - dot2num(b.IP);
    });
    Computers = Computers_New;
    Display();
}

function Remove_Old_Elements() {
    //remove the old headline
    var r1 = document.getElementById("Scan_Time_ID");
    if (r1) {
        r1.parentNode.removeChild(r1);
    }

    var r2 = document.getElementById("parent");
    if (r2) {
        r2.parentNode.removeChild(r2);
    }
    /*
        //remove the old entries
        var r3 = document.getElementById("parent");
        if (r3)
        {
            while (r3.hasChildNodes())
            {
                r3.removeChild(r2.lastChild);
            }
        }*/
}

function Display() {
    //remove all older elements
    //remove the old headline first
    Remove_Old_Elements();

    var Scan_Time_Headline = document.createElement("h1");
    Scan_Time_Headline.id = "Scan_Time_ID";
    Scan_Time_Headline.innerHTML = "Scan time: " + Scan_Time;
    document.body.appendChild(Scan_Time_Headline);
    var parent_div = document.createElement("div")
    parent_div.id = "parent";
    document.body.appendChild(parent_div);
    var Num_Hosts = Computers.length;

    for (var i in Computers) {
        var Computer_Element = document.createElement("div");
        Computer_Element.className = "Computer_Entry";
        Computer_Element.id = "child" + i.toString();

        //the box (actually 2 combined boxes for display)
        var Computer_Element_Info = document.createElement("div");
        Computer_Element_Info.className = "Information_Bar";
        var Computer_Element_Payload = document.createElement("div");
        Computer_Element_Payload.className = "Payload_Bar";

        //the IP address
        var Elem_IP = document.createElement("p");
        Elem_IP.innerHTML = "IP: " + Computers[i].IP;
        Elem_IP.className = "IP_Text";

        //the hostname
        var Elem_Name = document.createElement("p");
        Elem_Name.innerHTML = "Name: " + Computers[i].Hostname;
        Elem_Name.className = "Computer_Text";

        document.getElementById(parent_div.id).appendChild(Computer_Element);
        Computer_Element.appendChild(Computer_Element_Info);
        Computer_Element.appendChild(Computer_Element_Payload);
        Computer_Element_Info.appendChild(Elem_Name);
        Computer_Element_Info.appendChild(Elem_IP);

        var Service_Text = document.createElement("p");
        Service_Text.className = "Service_Text";

        if (Computers[i].Deactivated == true) {
            Service_Text.innerHTML = "System offline";
            Service_Text.style.fontSize = 24;
            Service_Text.style.color = "DarkGrey";
            Computer_Element_Info.style.backgroundColor = "#FE553E";

            //ensure no services are displayed
            Computers[i].SSH == "closed";
            Computers[i].HTTP == "closed"
        }
        else {
            Service_Text.innerHTML = "Available services:";
        }

        Computer_Element_Payload.appendChild(Service_Text);

        var Service_Flag = false;
        if (Computers[i].SSH == "open") {
            var Elem_SSH_Img = document.createElement("img");
            Elem_SSH_Img.src = "img/SSH_logo.png";
            Elem_SSH_Img.id = "port_logo";
            Computer_Element_Payload.appendChild(Elem_SSH_Img);
            Service_Flag = true;
        }

        if (Computers[i].HTTP == "open") {
            var Elem_HTTP_Link = document.createElement("a");
            Elem_HTTP_Link.href = "http://" + Computers[i].IP;
            Elem_HTTP_Link.target = "_blank";
            Elem_HTTP_Img = document.createElement("img");
            Elem_HTTP_Img.src = "img/HTTP_logo.png";
            Elem_HTTP_Img.id = "port_logo";
            Elem_HTTP_Link.appendChild(Elem_HTTP_Img);
            Computer_Element_Payload.appendChild(Elem_HTTP_Link);
            Service_Flag = true;
        }

        if (Service_Flag == false && Computers[i].Deactivated == false) {
            Service_Text.innerHTML = "No services available";
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
