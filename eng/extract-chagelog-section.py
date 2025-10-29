#!/usr/bin/env python3


import sys

if len(sys.argv) != 2:
    print(f"Expected 1 argument got {len(sys.argv)-1}: {sys.argv[1:]}")
    sys.exit(1)

version = sys.argv[1]
section = None

with open("CHANGELOG.md", 'r') as changelog:
    for line in changelog:
        if line.startswith("## "):
            if version in line:
                section = ""
            elif section != None:
                break
        elif section != None:
            if line.startswith("##"):
                section = section + line[1:]    
            else:
                section = section + line    

if section == None:
    print(f"Change log entry for version '{version}' not found.")
    sys.exit(1)
    
print(section)
