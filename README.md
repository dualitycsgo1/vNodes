# vNodes

<div align="center">

**A powerful node-based visual workflow editor for vMix with CS:GO gamestate integration**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![vMix](https://img.shields.io/badge/vMix-Compatible-orange.svg)](https://www.vmix.com/)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Building](#building) • [Screenshots](#screenshots)

</div>

---

## Overview

vNodes is a visual node editor that allows you to create complex automation workflows for vMix by connecting CS:GO gamestate events to vMix actions. Perfect for esports broadcasts, streamers, and production teams who want to automate their vMix setup based on in-game events.

## Features

### 🎨 Visual Node Editor
- **Drag & Drop Interface**: Intuitive canvas with pan, zoom, and snap-to-grid
- **Node Organization**: Group nodes into collapsible containers for better workflow management
- **Multi-Selection**: Hold Ctrl and click to select multiple nodes
- **Quick Grouping**: Select nodes and press Ctrl+G to auto-create fitting groups
- **Node Duplication**: Hold Alt while dragging to duplicate nodes instantly
- **Visual Connections**: Connect events to actions with smooth bezier curves
- **Real-time Preview**: See your workflow structure at a glance

### ⌨️ Keyboard Shortcuts
- **Alt + Drag**: Duplicate node at cursor position
- **Ctrl + Click**: Multi-select nodes
- **Ctrl + G**: Group selected nodes
- **Delete/Backspace**: Remove selected node, connection, or group
- **Ctrl + Z**: Undo last action
- **Ctrl + Shift + Z** or **Ctrl + Y**: Redo

### 🎮 CS:GO Gamestate Integration
- **15+ Event Triggers**: Timeout, round start/end, bomb events, player deaths, and more
- **Real-time Monitoring**: Instant detection of game state changes
- **No Game Modification**: Uses official CS:GO gamestate integration API

### 📺 Comprehensive vMix Control
- **100+ vMix Functions**: Organized into 9 categories (Audio, Transition, Input, Overlay, Output, Title, Replay, Mix, Other)
- **Smart Parameter UI**: Dynamic form fields adapt based on selected function
- **Multiple Actions**: Chain multiple vMix commands with custom delays
- **Parallel Execution**: Actions with the same delay execute simultaneously (perfect for crossfades)
- **vMix Triggers**: React to vMix state changes (overlay in/out, transition events, recording/streaming)
- **Countdown Controls**: Full support for countdown timers with flexible time formats (HH:MM:SS, MM:SS, or SS)

### 💾 Workflow Management
- **Auto-save**: Automatic workflow saving with 2-second debounce (toggle in top-right corner)
- **Preset System**: Save and load complete workflow configurations
- **Undo/Redo**: Full history tracking for up to 50 actions
- **Instant Testing**: Test nodes immediately with forced save before execution
- **Quick Loading**: Switch between different setups instantly
- **JSON Format**: Easy to share and version control

### 🚀 Standalone Distribution
- **Single Executable**: No Node.js installation required
- **Portable**: Copy the dist folder to any Windows machine
- **Auto Port Selection**: Automatically finds available port if default is busy (8082-8092)

## Installation

### Quick Start (Standalone)

1. **Download** the latest release from the [Releases](https://github.com/dualitycsgo1/vNodes/releases) page
2. **Extract** the ZIP file to your desired location
3. **Run** `run-vnodes.bat`
4. **Open** your browser to `http://localhost:8082`

### Development Setup

```bash
# Clone the repository
git clone https://github.com/dualitycsgo1/vNodes.git
cd vNodes

# Install dependencies
npm install

# Start the server
npm start
```

The web interface will be available at `http://localhost:8082`

## Usage

### 1. Configure vMix

1. Open vMix
2. Go to **Settings → Web Controller**
3. Enable **Web Controller** (default port 8088)

### 2. Configure CS:GO (Optional)

To receive CS:GO events:

1. Copy `gamestate_integration_cstrigger.cfg` to your CS:GO config folder:
   ```
   C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg\
   ```
2. Restart CS:GO or reconnect to a server

### 3. Create Your Workflow

1. **Drag Event Nodes** from the sidebar onto the canvas
2. **Drag vMix Action Nodes** to define what should happen
3. **Connect** event nodes to action nodes by dragging from output to input
4. **Configure Actions**:
   - Select vMix function from categorized dropdown
   - Fill in required parameters (Input, Value, Duration, etc.)
   - Add delays between actions if needed
5. **Organize** with groups by clicking "Create Group" and dragging nodes inside

### 4. Save Your Work

- Enter a preset name in the sidebar
- Click **Save** to store your workflow
- Load presets anytime from the presets list

## Available Events

### CS:GO Events
- ⏱️ Timeout Started / Timeout Over
- 🎮 Round Started / Round Over
- ❄️ Freeze Time Started / Over
- 🔥 Warmup Started / Over
- 🏁 Match Started / Game Over
- 💣 Bomb Planted / Defused / Exploded
- 💀 Player Died / Spawned

### vMix Triggers
- ➡️ Transition In/Out
- 👁️ Preview In/Out
- 🔷 Overlay 1-4 In/Out
- 🔴 Recording Start/Stop
- 📡 Streaming Start/Stop

## vMix Function Categories

- **Audio**: AudioOn/Off, Solo, Bus routing, Volume control
- **Transition**: Cut, Fade, Stinger 1-4, Transition 1-4
- **Input**: Preview, FullScreen, PlayPause, SelectIndex
- **Overlay**: OverlayInput 1-4 (In/Out/Zoom)
- **Output**: Recording, Streaming, External, MultiCorder
- **Title**: SetText, SetImage, BeginAnimation, TitlePreset
- **Replay**: Mark In/Out, Play, Record, Speed control
- **Mix**: ActiveInput, SetOutput, Pan/Zoom control
- **Other**: Scripts, Data sources, Layers, Dynamic values

## Building

### Create Standalone Executable

```bash
# Run the build script
.\build.bat
```

This creates a portable distribution in the `dist/` folder containing:
- `vnodes.exe` - Standalone executable
- `public/` - Web interface files
- `presets/` - Preset storage folder
- `run-vnodes.bat` - Easy launcher
- `gamestate_integration_cstrigger.cfg` - CS:GO config
- `README.md` - Documentation

### Manual Build

```bash
# Build for Windows
npm run build:win

# Copy required files
xcopy public dist\public\ /E /I /Y
mkdir dist\presets
copy gamestate_integration_cstrigger.cfg dist\
```

## Configuration

### Environment Variables

Create a `.env` file (optional):

```env
PORT=8082
VMIX_HOST=localhost
VMIX_PORT=8088
```

### Port Configuration

If port 8082 is busy, vNodes automatically tries ports 8083-8092. Check the console output for the actual port being used.

## Project Structure

```
vNodes/
├── server.js              # Main server with gamestate & vMix integration
├── public/
│   ├── index.html        # Web interface
│   ├── app.js            # Frontend logic & node editor
│   └── styles.css        # UI styling
├── presets/              # Saved workflow presets (JSON)
├── build.bat             # Build script for Windows
├── run-cstrigger.bat     # Development launcher
└── gamestate_integration_cstrigger.cfg  # CS:GO config
```

## Technical Details

### Backend (Node.js)
- **Express** server for web interface and API
- **Axios** for vMix HTTP API communication
- Gamestate integration endpoint at `POST /`
- RESTful API for node workflow management
- Automatic port fallback mechanism

### Frontend (Vanilla JS)
- Canvas-based node editor with pan/zoom
- SVG rendering for connections
- Dynamic parameter forms based on vMix function metadata
- LocalStorage for workflow persistence
- Collapsible sidebar sections

### Node System
- **Event Nodes**: Trigger workflows based on game or vMix state
- **Action Nodes**: Execute vMix functions with parameters
- **Groups**: Organize nodes with drag, resize, collapse
- **Connections**: Define execution flow between nodes

## Troubleshooting

### vNodes won't start
- Check if port 8082-8092 are available
- Kill any running `vnodes.exe` or `node.exe` processes
- Run as administrator if permission errors occur

### CS:GO events not detected
- Verify `gamestate_integration_cstrigger.cfg` is in the correct folder
- Restart CS:GO after adding the config
- Check server console for gamestate POST requests

### vMix actions not working
- Ensure vMix Web Controller is enabled (port 8088)
- Verify input names match exactly (case-sensitive)
- Check vMix API is accessible at `http://localhost:8088/api`

### Can't connect nodes
- Drag from the **output port** (right side) of event nodes
- Drop on the **input port** (left side) of action nodes
- Ensure you're not connecting two outputs or two inputs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Credits

Created by [dualitycsgo1](https://github.com/dualitycsgo1)

Built with ❤️ for the esports production community

---

<div align="center">

**[⬆ Back to Top](#vnodes)**

</div>
