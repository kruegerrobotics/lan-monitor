#!/usr/bin/env python
""" Helper program to create the control file inserting automatically the version"""

import string
import argparse
import sys
import git

def main():
    """simple main"""
    #process command line
    parser = argparse.ArgumentParser(description="provide input template and output file path")
    parser.add_argument("-t", "--template", help="the template control file")
    parser.add_argument("-d", "--destination", help="the destination file")
    parser.add_argument("-a", "--architecture", help="debian style architecture of the system e.g. amd64")
    parser.add_argument("-v", "--version", help="returns the version of the LAN monitor", action="store_true")
    args = parser.parse_args()

    #read version information
    repo = git.repo.Repo("../")
    version = repo.git.describe()[1:]
    if args.version:
        print(version)
        quit()

    #read available architectures
    if args.architecture == None:
        print("ERROR: No target architecture specified")
        parser.print_help()
        sys.exit(1)
    
    #read the template
    with open(args.template, "r") as file_in:
        src = string.Template(file_in.read())
        dictionary = {"VERSION":version, "ARCHITECTURE":args.architecture}
        result = src.substitute(dictionary)
        with open(args.destination, "w") as file_out:
            file_out.write("{0}".format(result))

if __name__ == "__main__":
    main()
    