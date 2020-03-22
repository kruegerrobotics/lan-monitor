import { Component, OnInit, ViewChild } from '@angular/core';
import { Networkdevice } from '../networkdevice';
import { DEVICES } from '../mock-devices';
import { MatTable } from '@angular/material';

@Component({
  selector: 'app-networkdevice',
  templateUrl: './networkdevice.component.html',
  styleUrls: ['./networkdevice.component.css']
})
export class NetworkdeviceComponent implements OnInit {

  devices = DEVICES
  counter = 5
  lastScanVar: String = "scanning ..."
  scanArgsVar: String = "scanning ..."

  displayedColumns: string[] = ['hostname', 'online', 'ports'];

  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  constructor() { }

  ngOnInit() {
    //console.log(this.devices)
    let ws = new WebSocket("ws://think-deb:8080/ws")

    ws.onopen = function (event) {
      let msg = { Commmand: "request" }
      ws.send(JSON.stringify(msg))
    }

    ws.onerror = this.onWSError.bind(this)

    ws.onclose = this.onWSClose.bind(this)

    ws.onmessage = this.onWSMessage.bind(this)
  }

  onWSMessage(event) {
    // console.log(event.data)
    let data = JSON.parse(event.data)
    this.scanArgsVar = "Args: " + data["nmaprun"]["-args"]
    this.lastScanVar = "Lastest scan: " + data["nmaprun"]["-startstr"]

    let hosts = data["nmaprun"]["host"]
    //console.log(args)

    //make everything offline since it will be refreshed soon
    this.devices.map(a => a.online = false)

    // console.log(hosts)
    hosts.forEach((host) => {
      let tempObj = <Networkdevice>{}
      tempObj.ports = []

      //mark as online since it was scanned :-)
      tempObj.online = true

      if (Array.isArray(host["address"])) {
        tempObj.ipaddress = host["address"][0]["-addr"]
      } else {
        tempObj.ipaddress = host["address"]["-addr"]
      }

      if (host["hostnames"]) {
        tempObj.hostname = host["hostnames"]["hostname"]["-name"]
      } else {
        tempObj.hostname = "unknown"
      }

      tempObj.ports.splice(0, tempObj.ports.length)
      host["ports"]["port"].forEach((port) => {

        let state = port["state"]["-state"]
        if (state == "open") {
          //console.log(tempObj.ipaddress + " " + port["-portid"])
          // console.log(tempObj)
          let p = port["-portid"]
          tempObj.ports.push(Number(p))
          //console.log("Ports for" + tempObj.hostname + " " + tempObj.ports)
          //console.log(tempObj)      
        }
      })

      //check if object is there
      //this.devices.find()
      let a = this.devices.find(x => x.ipaddress == tempObj.ipaddress)

      if (!a) {
        this.devices.push(tempObj)
      } else {
        a.online = true
        a.hostname = tempObj.hostname
        a.ports = tempObj.ports

      }
    })

    //sort array for IP addresses
    this.devices.sort((a, b) => {
      let aSplit = a.ipaddress.split('.')
      let bSplit = b.ipaddress.split('.')

      let aVal = ((((((+aSplit[0]) * 256) + (+aSplit[1])) * 256) + (+aSplit[2])) * 256) + (+aSplit[3])
      let bVal = ((((((+bSplit[0]) * 256) + (+bSplit[1])) * 256) + (+bSplit[2])) * 256) + (+bSplit[3])

      return aVal - bVal
    })

    //update html
    this.table.renderRows()



  }

  onWSClose() {
    console.log("ws closed")
    this.activateErrorState()
  }

  onWSError() {
    console.log("ws error")
    this.activateErrorState()
  }

  onDeleteBtn(){
     this.devices.length = 0
    this.table.renderRows()
  }

  activateErrorState(){
    this.lastScanVar = "ERROR connecting to server"
    this.scanArgsVar = "Refresh browser / check server"
  }

  c() {
    this.devices.push({ hostname: "computer" + this.counter, ipaddress: "192.168.1." + this.counter, online: false, ports: [123] })
    this.counter++
    this.devices.forEach((e) => {
      e.ports.length
    })
  }
}


