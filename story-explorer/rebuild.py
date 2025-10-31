#!/usr/bin/env python3
"""
Rebuild index.html by combining:
1. HTML header from story.html (lines 1-1203)
2. External script tags for nodes.js and connections.js
3. JavaScript functions from story.html (starting at line 4098)
"""

# Read the original story.html
with open('../story.html', 'r', encoding='utf-8') as f:
    story_lines = f.readlines()

# Part 1: HTML header (lines 1-1203)
header = ''.join(story_lines[0:1203])

# Part 2: External script tags
external_scripts = '''<script src="nodes.js"></script>
<script src="connections.js"></script>
<script>
// ==================== DATA MODEL ====================
// Data loaded from external files: nodes.js and connections.js

'''

# Part 3: JavaScript functions (from line 4098 onwards, which is index 4097)
functions = ''.join(story_lines[4097:])

# Combine all parts
output = header + external_scripts + functions

# Write to index.html
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(output)

print("✓ index.html rebuilt successfully!")
print(f"  - Header: {len(story_lines[0:1203])} lines")
print(f"  - External scripts: 5 lines")
print(f"  - Functions: {len(story_lines[4097:])} lines")
print(f"  - Total output: {len(output.splitlines())} lines")
