# Build Manual

In this file the build procedure is described


## Dependencies

In the [Dockerfile](../dockerimages/build-app/Dockerfile) for building all these are also listed

### Required for Debian the build process 

- fakeroot
- dpkg
- git
- make
- python3 python3-git

### Required for the server build (based on go)

- golang

### Go packages

github.com/basgys/goxml2json
github.com/gorilla/websocket

### Python

Python-git

### The web UI component is based on Angular

- npm

npm is required to install angular and after cloning to install the used packages

## Build all

From the repository root go to pkg-build and invoke make

```bash
cd pkg-build
make -f build-deb-pkg.makefile
```

Now all the executables, stand alone archives and Debian packages should be build

## Clean up

The delete all builded things run:

```bash
make -f build-deb-pkg.makefile clean
```
