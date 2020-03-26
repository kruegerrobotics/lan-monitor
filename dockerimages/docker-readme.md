# docker readme

This file explains the docker images

## build-app

In this folder is the docker file to create the build everything. It basically acts as a clean build environment to check if all dependencies are properly allocated and to track them. It builds both, lan-monitor-server and the webui with all go respective Angular files.

### Build the image

assuming we are in this folder

``` bash
cd build-app
docker docker image build -t lan-mon-builder:1.0 .
```

### Run the container

This only triggers the build process and ideally runs without error

``` bash
sudo docker run -i -t lan-mon-builder:1.0
```

## run-app

This container runs the full app

**still in development** Docker image to run the whole application.

### Build the image for running the app

``` bash
cd build-app
docker image build -t lan-mon-runner:1.0 .
```

### Run the container for scanning

This downloads downloads the lates release from github and runs it in the the container the port 8080 is exposed the webserver listens here. In the example we map this port to 6060.

``` bash
docker run --publish 6060:8080 -i -t lan-mon-runner:1.0
```

To see the result, just enter in your browser "localhost:6060"

