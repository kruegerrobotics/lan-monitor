package main

import (
	"bufio"
	"bytes"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

//VERSION of the program
var VERSION = "1.5.0"

var globalScanRange string
var globalScanIntervall int

func callNMAP() {
	log.Println("Starting nmap caller")
	var Counter = 1
	var tempScanFileName = "temp_scan.xml"
	var scanResultsFileName = "scan.xml"
	for {
		log.Println("Init NMAP scan no:", Counter)
		cmd := exec.Command("nmap", "-p", "22,80", "-oX", tempScanFileName, globalScanRange)
		cmd.Stdin = strings.NewReader("some input")
		var out bytes.Buffer
		cmd.Stdout = &out
		err := cmd.Run()
		if err != nil {
			log.Println(err)
		}
		log.Println("Scan no.", Counter, "complete")
		//log.Printf("in all caps: %q\n", out.String())
		Counter = Counter + 1

		//copy to the scan.xml
		r, err := os.Open(tempScanFileName)
		if err != nil {
			panic(err)
		}
		defer r.Close()

		w, err := os.Create(scanResultsFileName)
		if err != nil {
			panic(err)
		}
		defer w.Close()

		// do the actual work
		n, err := io.Copy(w, r)
		if err != nil {
			panic(err)
		}
		log.Printf("Scan results saved %v bytes\n", n)
		<-time.After(time.Duration(globalScanIntervall) * time.Second)
	}
}

func pageHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path[1:]
	log.Println("URL path: " + path)

	//in case we have no path refer/redirect to index.html
	if len(path) == 0 {
		path = "index.html"
	}

	f, err := os.Open(path)
	if err == nil {
		Reader := bufio.NewReader(f)

		var contentType string

		if strings.HasSuffix(path, "css") {
			contentType = "text/css"
		} else if strings.HasSuffix(path, ".html") {
			contentType = "text/html"
		} else if strings.HasSuffix(path, ".js") {
			contentType = "application/javascript"
		} else if strings.HasSuffix(path, ".png") {
			contentType = "image/png"
		} else if strings.HasSuffix(path, ".svg") {
			contentType = "image/svg+xml"
		} else {
			contentType = "text/plain"
		}

		w.Header().Add("Content Type", contentType)
		Reader.WriteTo(w)
	} else {
		w.WriteHeader(404)
		fmt.Fprintln(w, "404 - Page not found"+http.StatusText(404))
	}
}

func main() {
	log.Println("Starting lan-monitor-server")
	displayVersion := flag.Bool("version", false, "Prints the version number")
	httpPort := flag.Int("port", 8080, "HTTP port for the webserver (some ports e.g. 80 require su permissions)")
	nmapScanRange := flag.String("range", "192.168.1.1/24", "The range NMAP should scan e.g. 192.168.1.1/24 it has to be nmap compatible")
	scanIntervall := flag.Int("scan_rate", 120, "The intervall of the scans in seconds")
	flag.Parse()

	if *displayVersion == true {
		fmt.Println("Version: " + VERSION)
		return
	}

	//changing working dir
	log.Println("Changing working dir to: ")
	err := os.Chdir("../")
	if err != nil {
		log.Fatalln("Unable to switch to right dir")
	}

	workingDir, _ := os.Getwd()
	log.Println("Dir:" + workingDir)

	globalScanRange = *nmapScanRange
	globalScanIntervall = *scanIntervall

	//init the scanning routine
	go callNMAP()

	//starting the webserver
	http.HandleFunc("/", pageHandler)
	err = http.ListenAndServe(":"+strconv.Itoa(*httpPort), nil)
	if err != nil {
		log.Println("Server error - " + err.Error())
	}
}
