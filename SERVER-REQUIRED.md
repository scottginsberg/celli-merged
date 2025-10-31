# Local Server Required for ES6 Modules

## Why?

The new modular architecture uses ES6 module imports:
```javascript
import { INTERIORS_GRID_SIZE } from './js/interiors-constants.js';
```

Browsers block these imports when loading HTML files directly via `file://` protocol due to CORS security restrictions.

## Quick Start (Choose One)

### Option 1: Python Server (Recommended - Usually Pre-installed)

**Just double-click:** **`start-server.bat`**

✨ This will:
- Start a Python web server on port 8000
- Automatically open **Scale Ultra** in your browser
- Automatically open **Story Engine** in a second tab
- Show server logs in the console

Or run manually:
```bash
cd C:\Users\Scott\Desktop\celli-merged-main2\celli-merged-main
python -m http.server 8000
```
Then manually open: http://localhost:8000/scale-ultra.html

### Option 2: Node.js Server

**Just double-click:** **`start-server-node.bat`**

✨ Same auto-open behavior as Python version

Or run manually:
```bash
npx http-server -p 8000 -c-1
```

### Option 3: VS Code Live Server Extension

1. Install "Live Server" extension in VS Code
2. Right-click `scale-ultra.html` → "Open with Live Server"
3. Manually open Story Engine in another tab

## URLs After Server Starts

- **Scale Ultra**: http://localhost:8000/scale-ultra.html
- **Story Engine**: http://localhost:8000/story.html
- **Templates**: http://localhost:8000/templates/

## Troubleshooting

### "Python not found"
Install Python from: https://www.python.org/downloads/

### "Port 8000 already in use"
Change port in the batch file:
```bash
python -m http.server 8080  # Use port 8080 instead
```

### Still getting CORS errors?
- Make sure you're accessing via `http://localhost:8000/` not `file://`
- Check browser console for the exact URL being requested
- Verify all module paths in scale-ultra.html start with `./js/`

## Alternative: Inline Modules (Not Recommended)

If you absolutely cannot run a server, the modules would need to be inlined back into scale-ultra.html, which defeats the purpose of the modular refactoring.

