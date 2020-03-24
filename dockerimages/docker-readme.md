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

**still in development** Docker image to run the whole application.
