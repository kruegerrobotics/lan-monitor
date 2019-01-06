package main

import (
	"bytes"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"sync"
	"time"

	"github.com/BurntSushi/toml"
	xj "github.com/basgys/goxml2json"
	"github.com/gorilla/websocket"
)

//VERSION of the program
var version = "undefined-autogenerated"

//gobal variable to store all websocket connections for the update
var cons = make(map[*websocket.Conn]bool)

//mutex to lock the NMAP JSON information
var lock = sync.RWMutex{}

var nmapJSON *bytes.Buffer

//just for development
type msg struct {
	Command string
	Num     int
}

//Config data struct to read the config file
type Config struct {
	NMAPRange    string
	NMAPPorts    string //comma separated
	HTTPPort     int
	ScanInterval int //seconds
}

func echo(conn *websocket.Conn) {
	for {
		m := msg{}
		err := conn.ReadJSON(&m)
		if err != nil {
			log.Println("Error reading json.", err)
			break
		}
		log.Println("sending message")
		lock.RLock()
		log.Println("locked")
		if nmapJSON != nil {
			err := conn.WriteMessage(1, nmapJSON.Bytes())
			if err != nil {
				log.Println(err)
				break
			}
		}
		lock.RUnlock()
		log.Println("message sent")

		// err := conn.ReadJSON(&m)
		// if err != nil {
		// 	log.Println("Error reading json.", err)
		// 	break
		// }

		// log.Printf("Got message: %#v\n", m)

		// if err = conn.WriteJSON(m); err != nil {
		// 	log.Println(err)
		// 	break
		// }

		// //broadcast to all
		// for c := range cons {
		// 	c.WriteMessage(1, []byte("Broadcast"))
		// }
	}
	delete(cons, conn)
	conn.Close()
}

//ReadConfig reads the config file
func readConfig(configfile string) Config {
	var config Config
	if _, err := toml.DecodeFile(configfile, &config); err != nil {
		log.Fatal(err)
	}
	return config
}

func callNMAP(conf Config) {
	log.Println("Starting nmap caller")
	var counter = 1
	var scanResultsFileName = "scan.xml"

	cmd := exec.Command("nmap", "-p", conf.NMAPPorts, "-oX", scanResultsFileName, conf.NMAPRange)
	for {
		log.Println("Init NMAP scan no:", counter)
		var out bytes.Buffer
		cmd.Stdout = &out
		err := cmd.Run()
		if err != nil {
			log.Println(err)
		}
		log.Println("Scan no.", counter, "complete")
		counter = counter + 1

		//read the xml file, convert to json and send via the websockets
		xmlfile, err := os.Open(scanResultsFileName)
		if err != nil {
			log.Println(err)
		}
		lock.Lock()
		nmapJSON, err = xj.Convert(xmlfile)
		lock.Unlock()
		if err != nil {
			log.Println(err)
		}
		log.Println("Writing to websockets")
		for c := range cons {
			c.WriteMessage(1, nmapJSON.Bytes())
		}
		<-time.After(time.Duration(conf.ScanInterval) * time.Second)
	}
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Ws request")
	// log.Println("accepted from: http://" + r.Host)
	// if r.Header.Get("Origin") != "http://"+r.Host {
	// 	http.Error(w, "Origin not allowed", 403)
	// 	log.Println("Origin not allowed")
	// 	return
	// }
	conn, err := websocket.Upgrade(w, r, w.Header(), 0, 0)
	if err != nil {
		http.Error(w, "Could not open websocket connection", http.StatusBadRequest)
		log.Println("Upgrade error")
	}

	//add the connection to the pool for broadcast
	cons[conn] = true
	log.Println("New length:", len(cons))
	go echo(conn)
}

func main() {
	log.Println("Starting lan-monitor-server ver: " + version)

	//process the config
	//1st the config file is read and set parameters applied
	//2nd the command line parameters are interpreted,
	//if they are set they will overrule the config file
	//3rd if none of the above is applied the program reverts to the hardcoded defaults

	//defaults
	var config Config
	defaultConfigFileLocation := "/etc/lan-monitor.conf"
	config.HTTPPort = 8080
	config.NMAPRange = "192.168.0.1/24"
	config.NMAPPorts = "22,80"
	config.ScanInterval = 120 //seconds

	displayVersion := flag.Bool("version", false, "Prints the version number")
	cmdlineHTTPPort := flag.Int("port", config.HTTPPort, "HTTP port for the webserver")
	cmdlineNMAPScanRange := flag.String("range", config.NMAPRange, "The range NMAP should scan e.g. 192.168.1.1/24 it has to be nmap compatible")
	cmdlineScanInterval := flag.Int("scan-rate", config.ScanInterval, "The interval of the scans in seconds")
	configFileLocation := flag.String("config-file", defaultConfigFileLocation, "Location of the config file")
	cmdlinePorts := flag.String("scan-ports", config.NMAPPorts, "The ports that will be scanned")
	flag.Parse()

	//try to read the configfile
	_, err := os.Stat(*configFileLocation)
	if err == nil {
		config = readConfig(*configFileLocation)
	} else {
		log.Println("Config file is missing - looked at:", *configFileLocation)
		log.Println("Reverting to commandline/defaults")
	}

	//if no range is defined in the config file
	if config.NMAPRange == "" {
		config.NMAPRange = *cmdlineNMAPScanRange
	}

	//if no port is defined in the config file
	if config.HTTPPort == 0 {
		config.HTTPPort = *cmdlineHTTPPort
	}

	//if no scan interval is defined in the config file
	if config.ScanInterval == 0 {
		config.ScanInterval = *cmdlineScanInterval
	}

	//if no ports to be scanned are defined
	if config.NMAPPorts == "" {
		config.NMAPPorts = *cmdlinePorts
	}

	log.Println("Config - range:", config.NMAPRange, "webserver port:", config.HTTPPort, "interval:", config.ScanInterval, "sec", "scan-ports", config.NMAPPorts)

	if *displayVersion == true {
		fmt.Println("Version: " + version)
		return
	}

	//changing working dir
	log.Println("Changing working dir to: ")
	err = os.Chdir("../www")
	if err != nil {
		log.Fatalln("Unable to switch working dir")
	}

	workingDir, _ := os.Getwd()
	log.Println("Dir:" + workingDir)

	//init the scanning routine
	go callNMAP(config)

	//starting and configuring the webserver
	fs := http.FileServer(http.Dir(workingDir))
	http.HandleFunc("/ws", wsHandler)
	http.Handle("/", fs)
	listenAddress := ":" + strconv.Itoa(config.HTTPPort)
	log.Fatal(http.ListenAndServe(listenAddress, nil))
}
