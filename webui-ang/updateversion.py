#!/usr/bin/env python3
from git import Repo
import re

if __name__ == "__main__":
    print("Start")
    versionfile = "./src/environments/version.ts"
    repo = Repo(search_parent_directories=True)
    version = repo.git.describe()

    data = []

    with open(versionfile, "rt") as fin:
        for line in fin:
            line = re.sub("version:.+", "version:" + '"' + version + '"', line) 
            data.append(line)
    
    with open(versionfile, "wt") as fout:
        for line in data:
            fout.write(line)