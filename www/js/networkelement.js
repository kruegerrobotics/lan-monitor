class NetworkElement {
    constructor(ip, name, ports, goneOffline = false, draw = true) {
        this.ip = ip;
        this.computerName = name;
        this.portList = ports;
        this.goneOffline = goneOffline;

        if (draw == false) {
            return;
        }

        this.networkList = document.getElementById("networklist");

        //create the element
        this.parent = document.createElement("div");
        this.parent.className = "Computer_Entry";

        //add the information bar and its memebers
        let information = document.createElement("div");
        information.className = "Information_Bar";
        this.parent.appendChild(information);

        let ipText = document.createElement("p");
        ipText.className = "IP_Text"
        information.appendChild(ipText);
        ipText.innerHTML = "IP: " + this.ip;

        let computerText = document.createElement("p");
        computerText.className = "Computer_Text";
        information.appendChild(computerText);
        computerText.innerHTML = "Name: " + this.computerName;

        //add the payload and its members 
        let payload = document.createElement("div");
        payload.className = "Payload_Bar";
        this.networkList.appendChild(this.parent);
        this.parent.appendChild(payload);

        let serviceText = document.createElement("p");
        serviceText.className = "Service_Text";

        if (this.goneOffline) {
            serviceText.className = "Service_Text_Offline";
            serviceText.innerHTML = "System offline";
            information.className = "Information_Bar_Offline";
            payload.appendChild(serviceText);
            return;
        }
        

        if (this.portList.length == 0) {
            serviceText.innerHTML = "No services available";
            payload.appendChild(serviceText);
        }
        else {

            //all the ports
            for (let i = 0; i < this.portList.length; i++) {

                switch (this.portList[i]) {
                    case "22":
                        let sshLogo = document.createElement("img");
                        sshLogo.id = "port_logo";
                        sshLogo.src = "img/SSH_logo.png";
                        payload.appendChild(sshLogo);
                        break;
                    case "80":
                        let httpLink = document.createElement("a");
                        httpLink.href = "http://" + this.ip;
                        httpLink.target = "_blank";
                        payload.appendChild(httpLink);

                        let httpLogo = document.createElement("img");
                        httpLogo.src = "img/HTTP_logo.png";
                        httpLogo.id = "port_logo";
                        httpLink.appendChild(httpLogo);
                        break;
                    default:
                        let otherPortContainer = document.createElement("div");
                        otherPortContainer.innerText = this.portList[i];
                        payload.appendChild(otherPortContainer);
                }
            }
        }
    }

    removeElement() {
        if (this.parent) {
            this.parent.parentNode.removeChild(this.parent);
        }
    }
}
