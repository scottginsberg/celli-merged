# Local JavaScript Libraries

This directory contains JavaScript libraries served locally to avoid CORS issues.

## Files

### gif.worker.js
- **Purpose**: Web Worker for GIF.js library
- **Source**: https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js
- **Size**: ~16KB
- **Used by**: Screen Recorder (`src/scripts/tools/ScreenRecorder.js`)
- **Why Local**: Avoids CORS errors when running on localhost

## Updating

To update the worker script:

```bash
# PowerShell
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js" -OutFile "src/assets/js/gif.worker.js"

# Or wget/curl
wget https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js -O src/assets/js/gif.worker.js
curl https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js -o src/assets/js/gif.worker.js
```

## License

These libraries retain their original licenses. See source repositories for details.

