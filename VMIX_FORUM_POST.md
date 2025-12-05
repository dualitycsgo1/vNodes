# [NEW] vNodes - Visual Node-Based Workflow Editor for vMix (with CS:GO Integration!)

Hey vMix community! 👋

I'm excited to share a project I've been working on that might be useful for anyone looking to automate their vMix workflows, especially for esports broadcasts and game streaming.

---

## What is vNodes?

**vNodes** is a free, open-source visual node editor that lets you create automation workflows for vMix using a drag-and-drop interface. Think of it like a visual programming environment where you connect events to vMix actions without writing any code.

### Key Features:

🎨 **Visual Node Editor**
- Intuitive canvas with drag & drop, pan, and zoom
- Organize nodes into collapsible groups
- Visual connections between events and actions
- Save/load workflow presets

📺 **100+ vMix Functions Supported**
All organized into categories:
- **Audio**: Audio on/off, solo, bus routing, volume control
- **Transitions**: Cut, fade, stingers, custom transitions
- **Inputs**: Preview, fullscreen, playback control
- **Overlays**: All 4 overlay channels (in/out/zoom)
- **Recording/Streaming**: Start/stop controls
- **Titles**: SetText, SetImage, animations, presets
- **Replay**: Mark points, playback, speed control
- And many more!

🎮 **CS:GO/CS2 Gamestate Integration** (Bonus!)
As an esports fan, I built in support for Counter-Strike gamestate events:
- Timeout events
- Round start/end
- Bomb planted/defused/exploded
- Freeze time, warmup, match events
- Player deaths/spawns

But you don't need CS:GO to use it - the core vMix automation works standalone!

🎯 **vMix State Triggers**
React to vMix events automatically:
- Transition in/out
- Preview in/out
- Overlay 1-4 in/out
- Recording/streaming start/stop

---

## Use Cases

Here are some examples of what you can do:

**Esports Production:**
- Automatically fade to a specific input when a timeout is called in CS:GO
- Trigger replay sequences when important events happen
- Show/hide overlays based on game state

**Live Streaming:**
- Chain multiple transitions with custom delays
- Automatically start/stop recording based on vMix events
- Create complex overlay sequences triggered by a single action

**General Production:**
- Build reusable workflow templates
- Automate repetitive tasks
- Coordinate multiple vMix functions in sequence

---

## How It Works

1. **Create Event Nodes**: Drag CS:GO events or vMix triggers onto the canvas
2. **Add Action Nodes**: Create vMix action nodes with your desired functions
3. **Connect Them**: Draw connections from events to actions
4. **Configure**: Select vMix functions from organized dropdowns and fill in parameters
5. **Save**: Store your workflow as a preset for later use

The interface dynamically adjusts based on which vMix function you select - only showing relevant parameter fields (Input, Value, Duration, Mix, Channel, etc.)

---

## Technical Details

- **Platform**: Windows (standalone .exe, no installation required)
- **Requirements**: vMix Web Controller enabled (port 8088)
- **Port**: Runs on localhost:8082 (auto-selects next available if busy)
- **Footprint**: Lightweight, portable - just extract and run
- **Open Source**: MIT License

---

## Download & Setup

**Quick Start:**
1. Download the release from GitHub: [vNodes Repository](https://github.com/dualitycsgo1/vNodes)
2. Extract the ZIP file
3. Run `run-vnodes.bat`
4. Open browser to `http://localhost:8082`
5. Make sure vMix Web Controller is enabled (Settings → Web Controller)

**For CS:GO Integration (Optional):**
Copy the included `gamestate_integration_cstrigger.cfg` to your CS:GO config folder.

---

## Screenshots

*(If you can add screenshots showing:)*
- The node editor canvas with some connected nodes
- The categorized vMix function dropdown
- A saved preset being loaded
- Example workflow: CS:GO timeout → vMix fade transition

---

## Why I Built This

I've been doing esports broadcasts for a while and found myself wanting more flexible automation than basic shortcuts could provide. I wanted to:
- Chain multiple vMix actions together with delays
- Respond to game events automatically
- Save different configurations for different match types
- Have a visual representation of my automation logic

So I built vNodes! It's been really useful for my productions, and I thought others might find it helpful too.

---

## Current Status

This is a **v2.0.0-beta** release. It's fully functional and I've been using it in production, but as with any beta:
- There might be bugs (please report them!)
- Some features are still planned for future releases
- Feedback and suggestions are very welcome!

---

## Known Limitations

- Currently Windows only
- No undo/redo (yet!)
- Requires vMix Web Controller to be enabled
- Single instance per port

---

## What's Next?

I'm planning to add:
- Undo/redo functionality
- Workflow templates and sharing
- Custom event conditions
- Real-time vMix state visualization
- MacOS/Linux builds (if there's interest)

Your feedback will help shape the roadmap! 

---

## Get Involved

- **GitHub**: https://github.com/dualitycsgo1/vNodes
- **License**: MIT (free and open source)
- **Issues/Suggestions**: Feel free to open GitHub issues or discuss here

I'm happy to answer questions, help with setup, or hear your ideas for improvements!

---

## A Quick Example Workflow

Here's a simple workflow you could build in 30 seconds:

1. Drag "Timeout Started" event node → canvas
2. Drag "vMix Action" node → canvas  
3. Connect event to action
4. Select function: **Transition → Fade**
5. Set Input: "Your Camera Name"
6. Set Duration: 1000 (ms)
7. Done! Now every CS:GO timeout automatically fades to that camera.

Add more actions to the sequence, chain multiple transitions, add delays between steps - it's all visual and reusable!

---

## Final Thoughts

I built vNodes to solve my own automation challenges, but I'm sharing it in hopes it helps the broader vMix community. Whether you're doing esports broadcasts, church streaming, corporate events, or anything else - if you want visual workflow automation, give it a try!

All feedback, bug reports, feature requests, and success stories are welcome. Let me know what you think!

Happy mixing! 🎬

---

**TL;DR**: Free visual node editor for vMix automation. Drag-and-drop interface, 100+ vMix functions, workflow presets, CS:GO gamestate support (optional). No coding required. Windows standalone download available on GitHub.
