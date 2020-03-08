document.addEventListener("DOMContentLoaded", () => {
    // Create WebSocket connection.
    //let wsurl = location.host
    let wsurl = "127.0.0.1:8080"
    const socket = new WebSocket('ws://' + wsurl + '/ws');

    // Connection opened
    socket.addEventListener('open', event => {
        socket.send(JSON.stringify({ Commmand: 'request' }));
        console.log('sent');
    });

    // Listen for messages
    socket.addEventListener('message', event => {
        console.log('got msg');
        parseScanResults(JSON.parse(event.data));
    });
});

// Create an object with the Ip addresses as keys
let parseScanResults = data => {
    let scanResults = {
        scanArg: 'Scan arg: ' + data.nmaprun['-args'] + ' ' + data.nmaprun['-startstr'],
        hosts: data.nmaprun.host.reduce((obj, item) => {
            obj[item.address['-addr']] = item;
            return obj;
        }, {})
    };
    trackResults(scanResults);
};

// keeps the local scan results updated and updates hosts that are offline
let trackResults = data => {
    let localResults,
        newResults = data;

    if (localStorage.getItem('scanResults') === null) {
        localStorage.setItem('scanResults', JSON.stringify(data));
        // update view
        return;
    } else {
        localResults = JSON.parse(localStorage.getItem('scanResults'));
    }

    for (key of Object.keys(localResults.hosts)) {
        if (newResults.hosts[key] === undefined) localResults.hosts[key].status['-state'] = 'down';
        console.log(key)
        let nameNode = document.createElement("li")
        let nameTextNode = document.createTextNode(key)
        
        
        nameNode.appendChild(nameTextNode)
        //document.getElementById("scan-results").appendChild(nameNode)
    }

    for (key of Object.keys(newResults.hosts)) {
        if (localResults.hosts[key] === undefined || localResults.hosts[key].status['-state'] === 'down') {
            localResults.hosts[key] = newResults.hosts[key];
        }
    }
    localStorage.setItem('scanResults', JSON.stringify(localResults));
    // update view   

};


let loadScanResults = data => {
    // load results to view
};
