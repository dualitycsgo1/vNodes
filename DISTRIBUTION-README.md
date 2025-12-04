# vNodes - Standalone Distribution

## Quick Start

1. **Run the Application**: Double-click `run-vnodes.bat`
2. **Open Web Interface**: Go to http://localhost:8082 in your browser (or next available port)
3. **Configure CS:GO**: Copy `gamestate_integration_cstrigger.cfg` to your CS:GO config folder

## CS:GO Setup

Copy the `gamestate_integration_cstrigger.cfg` file to your Counter-Strike config directory:

```
C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg\
```

## vMix Setup

Make sure vMix Web Controller is enabled:
1. Open vMix
2. Go to Settings → Web Controller
3. Enable "Web Controller" (default port 8088)

## Usage

1. Start vNodes by running `run-vnodes.bat`
2. Create node workflows in the web interface
3. Connect CS:GO events to vMix actions using the visual node editor
4. Save your presets for different scenarios

## System Requirements

- Windows 10 or later (64-bit)
- vMix software installed and running
- Counter-Strike: Global Offensive or Counter-Strike 2

## Troubleshooting

- **Port 8082 in use**: Close other applications using this port
- **vMix not responding**: Check vMix Web Controller is enabled on port 8088
- **No gamestate data**: Verify the .cfg file is in the correct CS:GO directory

## Support

For issues or questions, check the console output when running the application.
The web interface provides real-time status and configuration options.