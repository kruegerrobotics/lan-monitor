function Start()
{
    Read_XML();
    setInterval(Read_XML, 60 * 1000);
}

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

//global variable array
var Computers = [];
var IPs = [];
var Scan_Time = "today";

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
            "Deactivated" : false
        };
        IPs.push(IP_Address)
        Computers_New.push(Computer);
    } //end for loop

    //check for lost/deactivated computers (they should be displayed grayed out)
    var missed = false;
    for (var old_c in Computers) {
            var Computer_Counter = 0;
        for(var new_c in Computers_New)
        {

            if (Computers_New[new_c].IP == Computers[old_c].IP)
            {
                //we found the same IP so we can move on
                missed = false;
                break;
            }
            Computer_Counter++;
            if (Computer_Counter == Computers_New.length)
            {
                //The computer is not here - we looking in the complete array
                var Missing_Computer = {
                    "Hostname": Computers[old_c].Hostname,
                    "IP": Computers[old_c].IP,
                    "SSH": Computers[old_c].SHH,
                    "HTTP": Computers[old_c].HTTP,
                    "Deactivated" : true
                };
                missed = true;
                Computers_New.push(Missing_Computer);
            }
        }

    }
    Computers_New.sort(function(a, b) {
        return dot2num(a.IP) - dot2num(b.IP);
    });
    Computers = Computers_New;
    Display();
}

function Remove_Old_Elements()
{
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
    Remove_Old_Elements()

    var Scan_Time_Headline = document.createElement("h1");
    Scan_Time_Headline.id = "Scan_Time_ID"
    Scan_Time_Headline.innerHTML = "Scan time: " + Scan_Time;
    document.body.appendChild(Scan_Time_Headline);
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

        if (Computers[i].Deactivated == true){
            child_input.style.backgroundColor = "DarkGrey";
        }

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
