function Read_XML() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            Display(this);
        }
    };
    xhttp.open("GET", "scan.xml", true);
    xhttp.send();
}

function Display(xml) {
    //preparations for the page design
    var parent_div = document.createElement("div")
       parent_div.id = "parent"
       document.body.appendChild(parent_div);

    var xmlDoc = xml.responseXML;
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
          console.log("Name: " + Hostname + " Portid: " + Port_ID + " status: " + Port_Status);
        }
        var SSH_State = Ports_Element[0].getElementsByTagName("state")[0].getAttribute("state");
        var HTTP_State = Ports_Element[1].getElementsByTagName("state")[0].getAttribute("state");
        console.log("Name check 2: SSH " + SSH_State + " HTTP " + HTTP_State);
        //if (Hostname_Elemet ).getAttribute("name");
        //var text = document.createTextNode("IP: " + IP_Address + " Name: " + Hostname);
        //var child = document.getElementById("ComputerList");
        //child.parentNode.insertBefore(text, child);

        var child_input = document.createElement("div");
        child_input.className = "Computer_Entry";
        child_input.id = "child" + i.toString();
        var Elem_IP =  document.createElement("p");
        Elem_IP.innerHTML = "IP: " + IP_Address;
        var Elem_Name =  document.createElement("p");
        Elem_Name.innerHTML = "Name: " + Hostname;

        document.getElementById(parent_div.id).appendChild(child_input);
        document.getElementById(child_input.id).appendChild(Elem_IP);
        document.getElementById(child_input.id).appendChild(Elem_Name);

        if (SSH_State == "open")
        {
            Elem_SSH_Img = document.createElement("img");
            Elem_SSH_Img.src = "img/SSH_logo.png";
            Elem_SSH_Img.id = "port_logo";
            //Elem_SSH_Img.style = "width:80px;margin:10px";
            document.getElementById(child_input.id).appendChild(Elem_SSH_Img);
        }

        if (HTTP_State == "open")
        {
            Elem_HTTP_Img = document.createElement("img");
            Elem_HTTP_Img.src = "img/HTTP_logo.png";
            Elem_HTTP_Img.id = "port_logo";
            //Elem_HTTP_Img.style = "width:80px";
            document.getElementById(child_input.id).appendChild(Elem_HTTP_Img);
        }





    }
    //var IP_Address = xmlDoc.getElementsByTagName("nmaprun")[0].childNodes[0].nodeName;
}
