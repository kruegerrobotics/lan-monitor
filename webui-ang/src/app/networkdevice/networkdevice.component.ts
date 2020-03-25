import { Component, OnInit, ViewChild } from '@angular/core';
import { Networkdevice } from '../networkdevice';
import { DEVICES } from '../mock-devices';
import { MatTable, MatDialog, MatDialogConfig } from '@angular/material';
import { ConfigDialogComponent } from '../config-dialog/config-dialog.component'
import { NmapArgDataShareService, NmapArgs } from '../nmap-arg-data-share.service'
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-networkdevice',
  templateUrl: './networkdevice.component.html',
  styleUrls: ['./networkdevice.component.css']
})
export class NetworkdeviceComponent implements OnInit {

  devices = DEVICES
  counter = 5
  lastScanVar: String = "retrieving data ..."
  scanArgsVar: String = "retrieving data ..."
  ws: WebSocket

  scanInfo: NmapArgs = new NmapArgs()

  displayedColumns: string[] = ['hostname', 'online', 'ports'];

  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  constructor(private dialog: MatDialog, private nmapArgsService: NmapArgDataShareService) {
  }

  ngOnInit() {

    //only for debugging (have the device populated with some dummy)
    this.devices.length = 0

    //websocket (consider using a service here)
    //the location is in the environment to switch between dev and production
    this.ws = new WebSocket(environment.scannerLocation)

    this.ws.onopen = (event) => {
      let msg = { Command: "request" }
      this.ws.send(JSON.stringify(msg))
    }

    this.ws.onerror = this.onWSError.bind(this)

    this.ws.onclose = this.onWSClose.bind(this)

    this.ws.onmessage = this.onWSMessage.bind(this)

    //service to exchange data with the config dialog
    this.nmapArgsService.sharedMessage.subscribe(message => this.scanInfo = message)
  }

  onWSMessage(event) {
    let data = JSON.parse(event.data)

    //check if this was the nmap message or one of the internal status message
    if (data.ServerStatus >= 0) {
      //this is the internal config
      this.scanInfo.scaninterval = data.ScanInterval
      if (data.NMAPStatus != 0) {
        let nmaperror = data.NMAPError.split("\n")
        this.devices.length = 0
        this.lastScanVar = "Warning: nmap scan failed"
        this.scanArgsVar =  "Error msg: " + nmaperror[0]
      }
      return
    }

    this.lastScanVar = "Lastest scan: " + data["nmaprun"]["-startstr"]

    this.parseArgs(data["nmaprun"]["-args"])

    //store this in the config dialog since it might have been changes from another location
    this.nmapArgsService.changeMessage(this.scanInfo)

    //display also the current scan (the xml file etc will be added automatically on server side)
    this.scanArgsVar = "Args: " + this.scanInfo.parameters + " " + this.scanInfo.ipRange


    //walk through the data
    let hosts = data["nmaprun"]["host"]

    //make everything offline since it will be refreshed soon
    this.devices.map(a => a.online = false)

    //loop through the scanned items
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

      //if the scan is only covering one port there is no array and the parsing has to be different
      if (Array.isArray(host["ports"]["port"]) == true) {
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
      } else {
        let port = host["ports"]["port"]
        if (port) {
          let state = port["state"]["-state"]

          if (state == "open") {
            //console.log(tempObj.ipaddress + " " + port["-portid"])
            // console.log(tempObj)
            let p = port["-portid"]
            tempObj.ports.push(Number(p))
          }
        }
      }
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
    this.activateErrorState()
  }

  onWSError() {
    this.activateErrorState()
  }

  onDeleteBtn() {
    this.devices.length = 0
    this.table.renderRows()
  }

  onSubnetBtn() {
    console.log("Subnet")
  }

  activateErrorState() {
    this.lastScanVar = "ERROR connecting to server"
    this.scanArgsVar = "Refresh browser / check server"
    this.devices.length = 0;
    this.table.renderRows()
  }


  c() {
    this.devices.push({ hostname: "computer" + this.counter, ipaddress: "192.168.1." + this.counter, online: false, ports: [123] })
    this.counter++
    this.devices.forEach((e) => {
      e.ports.length
    })
  }

  openDialog() {

    const dialogConfig = new MatDialogConfig()

    dialogConfig.disableClose = true
    dialogConfig.autoFocus = true
    const dialogRef = this.dialog.open(ConfigDialogComponent, dialogConfig)

    dialogRef.afterClosed().subscribe(
      data => {
        if (data) {
          //send the command to the websocket
          //use the parameters per input
          //(the server will add automatically the required field for storing as xml)
          let msg = {
            Command: "configure",
            Parameters: data.parameters,
            Range: data.ipRange,
            ScanInterval: data.scanInterval
          }
          this.ws.send(JSON.stringify(msg))
        }
      })

  }

  parseArgs(nmapArgs: String) {
    const searchExp: String = "-oX scan.xml"
    let index = nmapArgs.search("-oX scan.xml");
    this.scanInfo.parameters = nmapArgs.slice(5, index - 1)
    this.scanInfo.ipRange = nmapArgs.slice(searchExp.length + index + 1, nmapArgs.length)
  }
}


