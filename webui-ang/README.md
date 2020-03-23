# LAN-monitor web-UI

This is the web graphical user interface for the lan monitor and the main interface for the user. The hosting of the website is done by the lan-monitor-server in production mode. Also the websocket communication between the server and this part is equired.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli).

## Build requirements

This project is based on Angular. To build it Angular is required and for this npm. 

The steps in brief should be.

1. Install npm (this depends on OS)
2. Install Angular CLI

``` bash
npm install -g @angular/cli
```

3.Install Angular web ui dependencies
*assuming we are in project root*

``` bash
cd webui-ang
npm install
```

With these steps the system should be ready for the steps below.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

In addtion the lan-monitor server needs to run since it feeds the scan results to this web-ui via websockets. The location of websocket server is set in the environments files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

