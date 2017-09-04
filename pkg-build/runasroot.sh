#!/bin/bash

#root check
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit -1
fi