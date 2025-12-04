# CSTrigger - vMix Counter-Strike Integration

A Node.js server that listens for Counter-Strike gamestate integration events and automatically triggers audio playback in vMix when timeouts are detected.

## Features

- 🎯 **Gamestate Integration**: Receives real-time data from Counter-Strike via HTTP POST
- ⏰ **Timeout Detection**: Automatically detects when timeouts are called in matches
- 📺 **vMix Integration**: Triggers audio sources in vMix via REST API
- 🔊 **Configurable Audio**: Specify which audio source to play for timeout events
- 🚀 **Easy Setup**: Simple configuration and deployment

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure vMix

1. Open vMix and add an audio source for timeout sounds
2. Note the name of your audio input (e.g., "timeout-sound.wav")
3. Enable vMix Web Controller (Settings → Web Controller → Enable)

### 3. Configure Environment (Optional)

Create a `.env` file to customize settings:

```env
PORT=3000
VMIX_HOST=localhost
VMIX_PORT=8088
TIMEOUT_AUDIO_SOURCE=timeout-sound.wav
```

### 4. Start the Server

```bash
npm start
```

The server will start on port 3000 by default.

### 5. Configure Counter-Strike

Create a gamestate integration config file in your CS:GO/CS2 cfg folder:

**File**: `steamapps/common/Counter-Strike Global Offensive/game/csgo/cfg/gamestate_integration_cstrigger.cfg`

```
"CSTrigger vMix Integration"
{
    "uri"               "http://localhost:3000"
    "timeout"           "5.0"
    "buffer"            "0.1"
    "throttle"          "0.5"
    "heartbeat"         "30.0"
    "data"
    {
        "provider"      "1"
        "map"           "1"
        "round"         "1"
        "player_id"     "1"
        "player_state"  "1"
        "player_weapons" "1"
        "player_match_stats" "1"
    }
}
```

## Configuration Options

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `PORT` | `3000` | Server port |
| `VMIX_HOST` | `localhost` | vMix host address |
| `VMIX_PORT` | `8088` | vMix web controller port |
| `TIMEOUT_AUDIO_SOURCE` | `timeout-sound.wav` | Name of audio source in vMix |

## API Endpoints

- `POST /` - Receives gamestate integration data from Counter-Strike
- `GET /health` - Health check and configuration status
- `POST /test-audio` - Manually trigger timeout audio for testing

## Testing

### Test vMix Connection

Visit `http://localhost:3000/health` to verify the server is running and check vMix configuration.

### Test Audio Trigger

Send a POST request to `http://localhost:3000/test-audio` to manually trigger the timeout audio.

### Test with Counter-Strike

1. Start Counter-Strike with the gamestate integration config
2. Start or join a match
3. Call a timeout (if you have admin rights) or wait for a timeout to be called
4. The audio should play automatically in vMix

## Troubleshooting

### vMix Connection Issues

1. Verify vMix Web Controller is enabled
2. Check that vMix is running on the configured host/port
3. Ensure the audio source name matches exactly

### Counter-Strike Integration Issues

1. Verify the gamestate integration config file is in the correct location
2. Restart Counter-Strike after adding the config
3. Check server logs for incoming gamestate data

### Audio Not Playing

1. Test the `/test-audio` endpoint to verify vMix integration
2. Check that the audio source exists in vMix
3. Verify the audio source name in configuration

## Development

### Run with auto-restart

```bash
npm run dev
```

### Project Structure

```
CStrigger/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── README.md             # This file
└── .env                  # Environment variables (optional)
```

## License

MIT License - feel free to modify and distribute as needed.