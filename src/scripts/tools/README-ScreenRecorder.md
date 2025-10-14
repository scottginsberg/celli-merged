# Screen Recorder Module

A powerful screen recording feature that captures the entire viewport and exports it as an animated GIF.

## Features

- 🎥 **Configurable Recording Duration** (1-30 seconds)
- ⏱️ **Delay Start** (0-10 seconds) - gives you time to set up the scene
- 🖱️ **Show/Hide Cursor** - optionally include cursor in recording
- 🎨 **Show/Hide UI** - control whether UI elements appear in recording
- 📊 **Adjustable Quality/FPS** (5-30 FPS)
- 📦 **Automatic GIF Generation** with progress feedback
- 💾 **Save Prompt** with preview when recording completes
- 📥 **One-click download** with file size information

## Usage

### Basic Usage

1. Click the **🎥 Record** button in the bottom-right corner
2. Adjust settings in the panel:
   - **Duration**: How long to record (seconds)
   - **Delay Start**: Countdown before recording begins (seconds)
   - **Quality (FPS)**: Frames per second (higher = smoother but larger file)
   - **Show Cursor**: Include mouse cursor in recording
   - **Show UI Elements**: Include buttons and controls (recorder UI always hidden)
3. Click **Start** to begin recording
4. Recording starts after delay countdown
5. Progress bar shows recording status
6. GIF automatically generates - encoding progress displayed
7. **Save prompt appears** with animated preview and file details
8. Click **"💾 Save to Desktop"** to download the GIF to your Downloads folder
9. Success toast notification confirms the save

### Programmatic Usage

The screen recorder is exposed globally for debugging and programmatic control:

```javascript
// Access the recorder
window.screenRecorder

// Manually start recording
await window.screenRecorder.startRecording()

// Change settings programmatically
window.screenRecorder.settings.duration = 15
window.screenRecorder.settings.fps = 20
window.screenRecorder.settings.showCursor = false
window.screenRecorder.settings.showUI = true

// Stop recording manually (normally stops automatically)
window.screenRecorder.stopRecording()

// Destroy the recorder (cleanup)
window.screenRecorder.destroy()
```

## Technical Details

### Architecture

- **Module**: `src/scripts/tools/ScreenRecorder.js`
- **Styles**: `src/styles/recorder.css`
- **Dependencies**: GIF.js (loaded via CDN)

### How It Works

1. **Frame Capture**: Captures the main canvas (`#view`) at specified FPS intervals
2. **Cursor Drawing**: Optionally draws a custom cursor on each frame
3. **GIF Encoding**: Uses GIF.js library to encode frames into animated GIF
4. **Save Prompt**: Displays beautiful dialog with animated preview, file statistics (duration, FPS, size)
5. **Download**: Triggers browser download when user confirms
6. **UI Management**: Automatically hides recorder UI during recording; optionally hides other UI elements

### Files Structure

```
src/
├── assets/
│   └── js/
│       └── gif.worker.js         # GIF.js Web Worker (local, avoids CORS)
├── scripts/
│   └── tools/
│       ├── ScreenRecorder.js    # Main recorder class
│       └── README-ScreenRecorder.md  # This file
└── styles/
    └── recorder.css              # Recorder UI styles
```

### Integration

The recorder is automatically initialized when the app loads:

```javascript
// In index.html
import { screenRecorder } from './src/scripts/tools/ScreenRecorder.js';

// Exposed globally
window.screenRecorder = screenRecorder;
```

## Settings Reference

| Setting | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| `duration` | number | 1-30 | 10 | Recording length in seconds |
| `delay` | number | 0-10 | 0 | Countdown delay before recording starts |
| `fps` | number | 5-30 | 10 | Frames per second (quality) |
| `quality` | number | 1-30 | 10 | GIF.js quality (auto-calculated from FPS) |
| `showCursor` | boolean | - | true | Include cursor in recording |
| `showUI` | boolean | - | false | Include UI elements in recording |

## Performance Tips

- **Lower FPS** (5-10) for smaller file sizes and faster generation
- **Higher FPS** (20-30) for smoother animations (larger files)
- **Shorter duration** (5-10s) for optimal file size
- **Hide UI** for cleaner recordings focused on viewport content

## Browser Compatibility

- ✅ Modern Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (with limitations)
- ⚠️ Mobile browsers (may have performance issues)

## Troubleshooting

### Recording appears blank
- Ensure the main canvas (`#view`) is rendering
- Check browser console for errors
- Verify `preserveDrawingBuffer: true` is set in renderer config

### GIF takes long to generate
- Reduce FPS or duration
- Lower quality setting
- This is normal for longer recordings at high FPS

### UI elements show when they shouldn't
- Ensure "Show UI Elements" is unchecked
- Recorder UI is always hidden during recording

### CORS Error with Worker Script
- **Fixed**: Worker script now served locally from `src/assets/js/gif.worker.js`
- If missing, download from: https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js
- Place in: `src/assets/js/gif.worker.js`

### Error: "Failed to construct 'Worker'"
- Ensure `src/assets/js/gif.worker.js` exists
- Check file path is correct relative to `index.html`
- Verify web server is serving the file correctly

## Future Enhancements

Potential improvements:
- MP4/WebM video export option
- Region selection (partial screen recording)
- Audio capture support
- Frame-by-frame editor
- Custom watermarks
- Cloud upload integration

## License

Part of the Celli project.

