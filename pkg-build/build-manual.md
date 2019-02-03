# Build Manual

Here the build procedure is described


## Dependencies

In the [Dockerfile](../dockerimages/build-app/Dockerfile) for building all these are also listed

### Debian

- fakeroot
- dpkg
- git
- make
- golang
- python3 python3-git

### Go packages

github.com/basgys/goxml2json
github.com/gorilla/websocket

### Python

Python-git

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