# vNodes v2.0.0-beta - Initial Release

**Release Date**: December 4, 2025

---

## 🎉 First Public Beta Release

We're excited to announce the first beta release of **vNodes** - a powerful node-based visual workflow editor for vMix with CS:GO gamestate integration!

## ✨ What's New

### Core Features

#### 🎨 Visual Node Editor
- **Intuitive Canvas Interface**
  - Drag and drop nodes with smooth animations
  - Pan and zoom controls for large workflows
  - Grid snapping for precise positioning
  - Bezier curve connections between nodes
  
- **Node Organization System**
  - Create collapsible groups to organize workflows
  - Resize groups from all 8 directions (edges + corners)
  - Drag groups to move all contained nodes together
  - Delete groups without removing their contents

#### 🎮 CS:GO Gamestate Integration
- **15 Event Triggers**:
  - Timeout events (started/over)
  - Round events (started/concluded)
  - Freeze time events
  - Warmup events
  - Match events (started/game over)
  - Bomb events (planted/defused/exploded)
  - Player events (died/spawned)
  
- **Automatic Detection**: Real-time monitoring of CS:GO gamestate with no in-game modifications required

#### 📺 vMix Integration
- **100+ vMix Functions** organized into 9 categories:
  - Audio (27 functions) - Audio control, bus routing, solo
  - Transition (14 functions) - Cut, fade, stingers
  - Input (8 functions) - Preview, fullscreen, playback
  - Overlay (20 functions) - 4 overlay channels with in/out/zoom
  - Output (4 functions) - Recording, streaming, external, multicorder
  - Title (4 functions) - Text, images, animations, presets
  - Replay (13 functions) - Mark points, playback, recording
  - Mix (7 functions) - Active input, pan/zoom, output settings
  - Other (30+ functions) - Scripts, data sources, layers, dynamic values

- **Smart Parameter UI**
  - Dynamic form fields adapt based on selected vMix function
  - Contextual placeholders for input hints
  - Support for Input, Value, Mix, Channel, and Duration parameters
  - Organized dropdown with category sections

- **vMix State Triggers** (16 triggers):
  - Transition In/Out events
  - Preview In/Out events
  - Overlay 1-4 In/Out events
  - Recording Start/Stop events
  - Streaming Start/Stop events

#### 💾 Preset System
- Save complete workflows as JSON presets
- Quick load/switch between configurations
- Delete unused presets
- Shareable preset files for team collaboration

#### 🎯 Action Sequencing
- Chain multiple vMix actions per event
- Configurable delays between actions (in milliseconds)
- Reorder actions with up/down buttons
- Remove individual actions from sequences

### 🖥️ User Interface

#### Collapsible Sidebar
- **Event Nodes** - All CS:GO gamestate events
- **vMix Triggers** - vMix state change events
- **vMix Actions** - Create new action nodes
- **Organization** - Group creation tools
- **Presets** - Save/load workflow configurations
- **Status** - Node count and connection info

#### Top Toolbar
- Zoom in/out controls
- Reset zoom to 100%
- Center view on canvas
- Quick group creation
- Real-time zoom and pan position display

### 🚀 Deployment

#### Standalone Executable
- Single `.exe` file with embedded Node.js runtime
- No installation or dependencies required
- Portable - runs from any folder
- Includes all web interface files
- Auto-creates presets directory

#### Smart Port Management
- Automatic port detection (tries 8082-8092)
- Displays active port in console
- Warns when using fallback port
- Fails gracefully if no ports available

### 🔒 Security & Performance
- Content Security Policy headers for safe operation
- Efficient SVG rendering for connections
- RequestAnimationFrame for smooth group resizing
- Optimized event handling and state management

---

## 📦 Installation

### Option 1: Standalone (Recommended for Users)
1. Download the release ZIP file
2. Extract to your desired location
3. Run `run-vnodes.bat`
4. Open browser to `http://localhost:8082`

### Option 2: Development (For Contributors)
```bash
git clone https://github.com/dualitycsgo1/vNodes.git
cd vNodes
npm install
npm start
```

---

## 🎯 Quick Start Guide

### 1. Configure vMix
- Open vMix → Settings → Web Controller
- Enable Web Controller (port 8088)

### 2. Configure CS:GO (Optional)
- Copy `gamestate_integration_cstrigger.cfg` to:
  ```
  C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg\
  ```

### 3. Create Your First Workflow
1. Drag a **Timeout Started** event node onto the canvas
2. Drag a **New vMix Action** node below it
3. Connect the event output to the action input
4. Configure the action:
   - Select function: "Transition" → "Fade"
   - Set Input: "1" (or your input name)
   - Set Duration: "1000" (1 second fade)
5. Save as a preset!

---

## 🐛 Known Issues

- **Windows Only**: Currently only built for Windows (Node18-win-x64)
- **vMix Web Controller Required**: Must be enabled on port 8088
- **No Undo/Redo**: Workflow changes cannot be undone (save presets frequently!)
- **Connection Validation**: No validation that connections are logically correct
- **Single Instance**: Running multiple instances may conflict on port selection

---

## 🔮 Planned Features

Future releases may include:
- MacOS and Linux builds
- Undo/redo functionality
- Connection validation and error checking
- Workflow import/export with templates
- Custom event creation with conditions
- Real-time vMix state visualization
- Dark/light theme toggle
- Workflow comments and annotations
- Performance metrics and logging

---

## 🆘 Troubleshooting

### vNodes won't start
- Kill any running `vnodes.exe` processes
- Check console for port conflicts
- Try running as administrator

### CS:GO events not detected
- Verify config file is in correct CS:GO folder
- Restart CS:GO after adding config
- Check server console shows "Waiting for CS:GO gamestate data..."

### vMix actions not executing
- Confirm vMix Web Controller is enabled
- Verify input names match exactly (case-sensitive)
- Test vMix API manually: `http://localhost:8088/api`

### Nodes disappearing or UI glitches
- Clear browser cache and refresh
- Check browser console for errors
- Try a different browser (Chrome/Edge recommended)

---

## 📝 System Requirements

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 2GB minimum, 4GB recommended
- **Browser**: Modern browser (Chrome, Edge, Firefox)
- **vMix**: Any version with Web Controller support
- **CS:GO/CS2**: Optional, for gamestate integration
- **Network**: vMix must be accessible on localhost:8088

---

## 🤝 Contributing

This is a beta release and we welcome contributions! 

- **Report bugs**: Open an issue on GitHub
- **Suggest features**: Start a discussion
- **Submit PRs**: Fork, branch, commit, push, PR!

---

## 📄 License

MIT License - See LICENSE file for full details

---

## 🙏 Credits

**Created by**: [@dualitycsgo1](https://github.com/dualitycsgo1)

Built with:
- Node.js & Express
- Vanilla JavaScript (no frameworks!)
- SVG for beautiful connections
- Love for esports production ❤️

---

## 📢 Feedback

This is a **beta release** - your feedback is invaluable!

- Found a bug? [Open an issue](https://github.com/dualitycsgo1/vNodes/issues)
- Have an idea? [Start a discussion](https://github.com/dualitycsgo1/vNodes/discussions)
- Built something cool? Share it with the community!

---

<div align="center">

**Thank you for trying vNodes! 🚀**

[Download Release](https://github.com/dualitycsgo1/vNodes/releases) • [Documentation](https://github.com/dualitycsgo1/vNodes#readme) • [Report Issue](https://github.com/dualitycsgo1/vNodes/issues)

</div>
