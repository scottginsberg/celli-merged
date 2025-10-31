with open('../story.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Header: lines 1-1203 (indices 0-1202) - everything BEFORE <script>
header = lines[0:1203]

# Add our script tags
scripts = [
    '<script src="nodes.js"></script>\n',
    '<script src="connections.js"></script>\n',
    '<script>\n'
]

# Functions: from line 4098 (index 4097)
functions = lines[4097:]

# Combine and write
with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(header + scripts + functions)

print('✅ Fixed! index.html created successfully')
print(f'Total lines: {len(header) + len(scripts) + len(functions)}')



