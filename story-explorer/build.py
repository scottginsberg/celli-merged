#!/usr/bin/env python3
# Build clean index.html

with open('../story.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Header: lines 1-1204 (indices 0-1203)
header = lines[0:1204]

# Script tags (outside the <script> block!)
scripts = [
    '<script src="nodes.js"></script>\n',
    '<script src="connections.js"></script>\n',
    '<script>\n'
]

# Functions: starting from line 4098 (index 4097)
# This is "function getDesireEvolution(characterId) {"
functions = lines[4097:]

# Combine
output = header + scripts + functions

# Write
with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(output)

print(f"✅ Created index.html: {len(output)} lines")
print(f"   Header: {len(header)} lines")
print(f"   Scripts: {len(scripts)} lines")  
print(f"   Functions: {len(functions)} lines")
print(f"\nFirst function line: {functions[0][:60]}")



