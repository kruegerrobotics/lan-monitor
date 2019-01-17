#!/usr/bin/env python3
""" Helper program to create the control file inserting automatically the version"""

import string
import argparse
import sys
import git
import os


def get_size(start_path='.'):
    """calculates the size of a directory with all its containing files  """
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(start_path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            total_size += os.path.getsize(fp)
    return total_size


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
        sys.exit()

    # read available architectures
    if args.architecture is None:
        print("ERROR: No target architecture specified")
        parser.print_help()
        sys.exit(1)

    # calculate the package size
    www_folder_size = get_size("../www")
    binary_file_path = "build_" + args.architecture + "_linux_binary/lan-monitor-server"
    binary_file_size = os.path.getsize(binary_file_path)

    # read the template
    with open(args.template, "r") as file_in:
        src = string.Template(file_in.read())
        dictionary = {"VERSION":version, "ARCHITECTURE":args.architecture, "SIZE": binary_file_size + www_folder_size}
        result = src.substitute(dictionary)
        with open(args.destination, "w") as file_out:
            file_out.write("{0}".format(result))


if __name__ == "__main__":
    main()
