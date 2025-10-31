#!/usr/bin/env python3
"""
Rebuild index.html by finding where actual JavaScript functions start
"""

# Read the original story.html
with open('../story.html', 'r', encoding='utf-8') as f:
    story_lines = f.readlines()

# Find where getAllEvents function starts (this is after all node data)
func_start = None
for i, line in enumerate(story_lines):
    if 'function getAllEvents()' in line:
        func_start = i
        break

if not func_start:
    print("ERROR: Could not find getAllEvents function")
    exit(1)

print(f"Found getAllEvents at line {func_start + 1}")

# Part 1: HTML header (lines 1-1203)
header = ''.join(story_lines[0:1203])

# Part 2: External script tags
external_scripts = '''<script src="nodes.js"></script>
<script src="connections.js"></script>
<script>
// ==================== DATA MODEL ====================
// Data loaded from external files: nodes.js and connections.js

// Helper function to get desire evolution for a character
function getDesireEvolution(characterId) {
  return desireEvolution
    .filter(d => d.characterId === characterId)
    .sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateA - dateB;
    });
}

'''

# Part 3: JavaScript functions (from getAllEvents onwards)
functions = ''.join(story_lines[func_start:])

# Combine all parts
output = header + external_scripts + functions

# Write to index.html
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(output)

print("✓ index.html rebuilt successfully!")
print(f"  - Header: 1203 lines")
print(f"  - External scripts + helper: ~15 lines")
print(f"  - Functions: {len(story_lines[func_start:])} lines")
print(f"  - Total output: {len(output.splitlines())} lines")



