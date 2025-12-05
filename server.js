const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8082;

// vMix configuration
const VMIX_HOST = process.env.VMIX_HOST || 'localhost';
const VMIX_PORT = process.env.VMIX_PORT || 8088;
const VMIX_API_URL = `http://${VMIX_HOST}:${VMIX_PORT}/api`;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add security headers including CSP for DevTools
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "connect-src 'self' http://localhost:* ws://localhost:*; " +
        "img-src 'self' data:; " +
        "font-src 'self' data:;"
    );
    next();
});

// Serve static files - handle both development and packaged executable
const publicPath = path.join(process.pkg ? process.cwd() : __dirname, 'public');
app.use(express.static(publicPath));
console.log('📁 Serving static files from:', publicPath);

// Store current gamestate and previous state for change detection
let currentGameState = {};
let previousGameState = {};

// vMix state tracking for triggers
let vmixState = {
    inputs: [],
    activeInput: null,
    previewInput: null,
    overlays: { 1: null, 2: null, 3: null, 4: null },
    recording: false,
    streaming: false,
    external: false
};
let previousVmixState = JSON.parse(JSON.stringify(vmixState));

// Node-based workflow storage
let nodeWorkflow = {
    nodes: [],
    connections: []
};

// Presets directory - handle both development and packaged executable
// In packaged apps, __dirname points to snapshot, so use process.cwd() instead
const PRESETS_DIR = path.join(process.pkg ? process.cwd() : __dirname, 'presets');
if (!fs.existsSync(PRESETS_DIR)) {
    fs.mkdirSync(PRESETS_DIR, { recursive: true });
}

// ==================== VMIX STATE POLLING ====================

// Poll vMix state for trigger detection
async function pollVmixState() {
    try {
        const response = await axios.get(`${VMIX_API_URL}`);
        const xmlData = response.data;
        
        // Parse XML to extract state
        previousVmixState = JSON.parse(JSON.stringify(vmixState));
        
        // Extract active and preview input NUMBERS
        const activeMatch = xmlData.match(/<active>(\d+)<\/active>/);
        const previewMatch = xmlData.match(/<preview>(\d+)<\/preview>/);
        
        const activeNumber = activeMatch ? activeMatch[1] : null;
        const previewNumber = previewMatch ? previewMatch[1] : null;
        
        // Convert input numbers to input NAMES by parsing the XML
        vmixState.activeInput = activeNumber ? getInputNameByNumber(xmlData, activeNumber) : null;
        vmixState.previewInput = previewNumber ? getInputNameByNumber(xmlData, previewNumber) : null;
        
        // Extract overlay states (convert numbers to names)
        for (let i = 1; i <= 4; i++) {
            const overlayMatch = xmlData.match(new RegExp(`<overlay number="${i}"[^>]*>([^<]*)<\/overlay>`));
            const overlayNumber = overlayMatch ? overlayMatch[1] : null;
            vmixState.overlays[i] = overlayNumber ? getInputNameByNumber(xmlData, overlayNumber) : null;
        }
        
        // Extract recording/streaming states
        vmixState.recording = xmlData.includes('<recording>True</recording>');
        vmixState.streaming = xmlData.includes('<streaming>True</streaming>');
        vmixState.external = xmlData.includes('<external>True</external>');
        
        // Debug: Log state changes
        if (vmixState.activeInput !== previousVmixState.activeInput) {
            console.log(`🔄 Active input changed: ${previousVmixState.activeInput} → ${vmixState.activeInput}`);
        }
        
        // Process vMix triggers
        processVmixTriggers();
        
    } catch (error) {
        // Only log error once on startup, then silently fail
        if (!pollVmixState.errorLogged) {
            console.log('⚠️  vMix not available - triggers will be inactive until vMix is detected');
            pollVmixState.errorLogged = true;
        }
    }
}

// Helper function to get input name by number from vMix XML
function getInputNameByNumber(xmlData, inputNumber) {
    // Match input with specific number and extract its key (name)
    const regex = new RegExp(`<input[^>]*number="${inputNumber}"[^>]*key="([^"]*)"`, 'i');
    const match = xmlData.match(regex);
    const name = match ? match[1] : inputNumber;
    
    // Debug logging (only once per startup to avoid spam)
    if (!getInputNameByNumber.logged && match) {
        console.log(`📝 Example input mapping: #${inputNumber} = "${name}"`);
        getInputNameByNumber.logged = true;
    }
    
    return name; // Fall back to number if name not found
}

// Process vMix trigger nodes
function processVmixTriggers() {
    const vmixTriggerNodes = nodeWorkflow.nodes.filter(node => node.type === 'vmix-trigger');
    
    vmixTriggerNodes.forEach(triggerNode => {
        const triggered = checkVmixTrigger(triggerNode);
        
        if (triggered) {
            const config = triggerNode.config || {};
            const targetInfo = config.targetInput ? ` for input: ${config.targetInput}` : '';
            console.log(`🎯 vMix Trigger: ${triggerNode.triggerType}${targetInfo}`);
            
            // Find all connections from this trigger node
            const connections = nodeWorkflow.connections.filter(conn => conn.fromNodeId === triggerNode.id);
            
            // Trigger all connected action nodes
            connections.forEach(connection => {
                const actionNode = nodeWorkflow.nodes.find(n => n.id === connection.toNodeId);
                if (actionNode && actionNode.type === 'action') {
                    executeVmixAction(actionNode, triggerNode.triggerType);
                }
            });
        }
    });
}

// Check if a vMix trigger condition is met
function checkVmixTrigger(triggerNode) {
    const config = triggerNode.config || {};
    const triggerType = triggerNode.triggerType;
    const targetInput = config.targetInput;
    
    switch(triggerType) {
        case 'OnTransitionIn':
            // Check if specific input became active
            if (targetInput) {
                const matched = vmixState.activeInput === targetInput && previousVmixState.activeInput !== targetInput;
                if (matched) {
                    console.log(`  📍 Match: ${previousVmixState.activeInput || 'none'} → ${vmixState.activeInput}`);
                }
                return matched;
            }
            // Or any transition
            if (vmixState.activeInput !== previousVmixState.activeInput && vmixState.activeInput !== null) {
                console.log(`  📍 Any transition: ${previousVmixState.activeInput || 'none'} → ${vmixState.activeInput}`);
                return true;
            }
            return false;
        
        case 'OnTransitionOut':
            // Check if specific input left active
            if (targetInput) {
                return previousVmixState.activeInput === targetInput && vmixState.activeInput !== targetInput;
            }
            return vmixState.activeInput !== previousVmixState.activeInput && previousVmixState.activeInput !== null;
        
        case 'OnPreviewIn':
            if (targetInput) {
                return vmixState.previewInput === targetInput && previousVmixState.previewInput !== targetInput;
            }
            return vmixState.previewInput !== previousVmixState.previewInput && vmixState.previewInput !== null;
        
        case 'OnPreviewOut':
            if (targetInput) {
                return previousVmixState.previewInput === targetInput && vmixState.previewInput !== targetInput;
            }
            return vmixState.previewInput !== previousVmixState.previewInput && previousVmixState.previewInput !== null;
        
        case 'OnOverlay1In':
        case 'OnOverlay2In':
        case 'OnOverlay3In':
        case 'OnOverlay4In':
            const overlayNum = triggerType.match(/\d+/)[0];
            if (targetInput) {
                return vmixState.overlays[overlayNum] === targetInput && previousVmixState.overlays[overlayNum] !== targetInput;
            }
            return vmixState.overlays[overlayNum] !== null && previousVmixState.overlays[overlayNum] === null;
        
        case 'OnOverlay1Out':
        case 'OnOverlay2Out':
        case 'OnOverlay3Out':
        case 'OnOverlay4Out':
            const overlayNumOut = triggerType.match(/\d+/)[0];
            if (targetInput) {
                return previousVmixState.overlays[overlayNumOut] === targetInput && vmixState.overlays[overlayNumOut] !== targetInput;
            }
            return previousVmixState.overlays[overlayNumOut] !== null && vmixState.overlays[overlayNumOut] === null;
        
        case 'OnRecordingStart':
            return vmixState.recording && !previousVmixState.recording;
        
        case 'OnRecordingStop':
            return !vmixState.recording && previousVmixState.recording;
        
        case 'OnStreamingStart':
            return vmixState.streaming && !previousVmixState.streaming;
        
        case 'OnStreamingStop':
            return !vmixState.streaming && previousVmixState.streaming;
        
        case 'OnExternalStart':
            return vmixState.external && !previousVmixState.external;
        
        case 'OnExternalStop':
            return !vmixState.external && previousVmixState.external;
        
        default:
            return false;
    }
}

// Start polling vMix state every 100ms
setInterval(pollVmixState, 100);

// ==================== GAMESTATE PROCESSING ====================

// CS:GO Gamestate Integration endpoint
app.post('/', express.json(), (req, res) => {
    currentGameState = req.body;
    
    // Process the gamestate through the node workflow
    processNodeWorkflow(currentGameState, previousGameState);
    
    // Update previous state
    previousGameState = JSON.parse(JSON.stringify(currentGameState));
    
    res.sendStatus(200);
});

// Process gamestate through node workflow
function processNodeWorkflow(current, previous) {
    // Get all event nodes (input nodes)
    const eventNodes = nodeWorkflow.nodes.filter(node => node.type === 'event');
    
    eventNodes.forEach(eventNode => {
        // Check if this event has been triggered
        const triggered = checkEventTriggered(eventNode.eventType, current, previous);
        
        if (triggered) {
            console.log(`🎯 Event triggered: ${eventNode.eventType}`);
            
            // Find all connections from this event node
            const connections = nodeWorkflow.connections.filter(conn => conn.fromNodeId === eventNode.id);
            
            // Trigger all connected action nodes
            connections.forEach(connection => {
                const actionNode = nodeWorkflow.nodes.find(n => n.id === connection.toNodeId);
                if (actionNode && actionNode.type === 'action') {
                    executeVmixAction(actionNode, eventNode.eventType);
                }
            });
        }
    });
}

// Check if a specific event has been triggered
function checkEventTriggered(eventType, current, previous) {
    const map = current.map || {};
    const prevMap = previous.map || {};
    const round = current.round || {};
    const prevRound = previous.round || {};
    const player = current.player || {};
    const prevPlayer = previous.player || {};
    const bomb = current.bomb || {};
    const prevBomb = previous.bomb || {};
    const phaseCountdowns = current.phase_countdowns || {};
    const prevPhaseCountdowns = previous.phase_countdowns || {};
    
    switch(eventType) {
        // Timeout Events
        case 'timeout_started':
            return (phaseCountdowns.phase === 'timeout_t' || phaseCountdowns.phase === 'timeout_ct') &&
                   (prevPhaseCountdowns.phase !== 'timeout_t' && prevPhaseCountdowns.phase !== 'timeout_ct');
        
        case 'timeout_over':
            return (prevPhaseCountdowns.phase === 'timeout_t' || prevPhaseCountdowns.phase === 'timeout_ct') &&
                   (phaseCountdowns.phase !== 'timeout_t' && phaseCountdowns.phase !== 'timeout_ct');
        
        // Round Events
        case 'round_started':
            return round.phase === 'live' && prevRound.phase !== 'live';
        
        case 'round_concluded':
            return round.phase === 'over' && prevRound.phase !== 'over';
        
        case 'freeze_time_started':
            return round.phase === 'freezetime' && prevRound.phase !== 'freezetime';
        
        case 'freeze_time_over':
            return prevRound.phase === 'freezetime' && round.phase !== 'freezetime';
        
        // Map Events
        case 'warmup_started':
            return map.phase === 'warmup' && prevMap.phase !== 'warmup';
        
        case 'warmup_over':
            return prevMap.phase === 'warmup' && map.phase !== 'warmup';
        
        case 'match_started':
            return map.phase === 'live' && prevMap.phase !== 'live';
        
        case 'gameover':
            return map.phase === 'gameover' && prevMap.phase !== 'gameover';
        
        // Bomb Events
        case 'bomb_planted':
            return bomb.state === 'planted' && prevBomb.state !== 'planted';
        
        case 'bomb_defused':
            return bomb.state === 'defused' && prevBomb.state !== 'defused';
        
        case 'bomb_exploded':
            return bomb.state === 'exploded' && prevBomb.state !== 'exploded';
        
        // Player Events
        case 'player_died':
            return player.state?.health === 0 && prevPlayer.state?.health > 0;
        
        case 'player_spawned':
            return player.state?.health > 0 && prevPlayer.state?.health === 0;
        
        default:
            return false;
    }
}

// Execute a single vMix command
async function executeSingleVmixCommand(action, eventName) {
    let url = `${VMIX_API_URL}/?Function=${action.function || 'PlayPause'}`;
    
    // Only add parameters if they have actual values (not empty strings)
    if (action.input && action.input.trim()) {
        url += `&Input=${encodeURIComponent(action.input.trim())}`;
    }
    
    // Special handling for SetVolumeFade - combine value and duration
    if (action.function === 'SetVolumeFade') {
        const volume = action.value && action.value.trim() ? action.value.trim() : '0';
        const duration = action.duration && action.duration.toString().trim() ? action.duration.toString().trim() : '1000';
        url += `&Value=${encodeURIComponent(volume)},${encodeURIComponent(duration)}`;
    } else {
        // Normal value handling for other functions
        if (action.value && action.value.trim()) {
            url += `&Value=${encodeURIComponent(action.value.trim())}`;
        }
        if (action.duration && action.duration.toString().trim()) {
            url += `&Duration=${encodeURIComponent(action.duration.toString().trim())}`;
        }
    }
    
    if (action.mix && action.mix.toString().trim()) {
        url += `&Mix=${encodeURIComponent(action.mix.toString().trim())}`;
    }
    if (action.transition && action.transition.trim()) {
        url += `&Transition=${encodeURIComponent(action.transition.trim())}`;
    }
    if (action.selectedIndex && action.selectedIndex.toString().trim()) {
        url += `&SelectedIndex=${encodeURIComponent(action.selectedIndex.toString().trim())}`;
    }
    
    console.log(`  🌐 API Call: ${url}`);
    await axios.get(url);
    console.log(`  ↳ ${action.function} ${action.input ? `→ ${action.input}` : ''}`);
}

// Execute vMix action sequence for a node
async function executeVmixAction(actionNode, eventName) {
    try {
        const config = actionNode.config || {};
        
        // Support both old single-action format and new action sequence format
        const actionSequence = config.actionSequence || [];
        
        if (actionSequence.length > 0) {
            console.log(`🎬 ${eventName} - Executing ${actionSequence.length} action(s):`);
            
            // Execute each action in sequence
            for (const action of actionSequence) {
                // Apply delay before this action
                const delay = parseInt(action.delay) || 0;
                if (delay > 0) {
                    console.log(`  ⏱️  Wait ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                
                // Execute the action
                await executeSingleVmixCommand(action, eventName);
            }
            
            console.log(`✅ ${eventName} - Sequence completed`);
        } else {
            // Legacy support for old single-action format
            const delay = parseInt(config.delay) || 0;
            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            if (config.vmixInput) {
                if (config.restartInput) {
                    const restartUrl = `${VMIX_API_URL}/?Function=Restart&Input=${encodeURIComponent(config.vmixInput)}`;
                    await axios.get(restartUrl);
                }
                
                if (config.audioOnInput) {
                    const audioOnUrl = `${VMIX_API_URL}/?Function=AudioOn&Input=${encodeURIComponent(config.vmixInput)}`;
                    await axios.get(audioOnUrl);
                }
            }
            
            let url = `${VMIX_API_URL}/?Function=${config.vmixFunction || 'PlayPause'}`;
            
            if (config.vmixInput) url += `&Input=${encodeURIComponent(config.vmixInput)}`;
            if (config.functionValue) url += `&Value=${encodeURIComponent(config.functionValue)}`;
            if (config.duration) url += `&Duration=${encodeURIComponent(config.duration)}`;
            if (config.mix) url += `&Mix=${encodeURIComponent(config.mix)}`;
            if (config.transition) url += `&Transition=${encodeURIComponent(config.transition)}`;
            if (config.selectedIndex) url += `&SelectedIndex=${encodeURIComponent(config.selectedIndex)}`;
            
            await axios.get(url);
            
            const actions = [config.vmixFunction || 'PlayPause'];
            if (config.restartInput) actions.unshift('Restart');
            if (config.audioOnInput) actions.unshift('AudioOn');
            if (delay > 0) actions.unshift(`Delay:${delay}ms`);
            
            console.log(`✅ ${eventName} → [${actions.join(' → ')}] → ${config.vmixInput || 'vMix'}`);
        }
        
    } catch (error) {
        console.error(`❌ Failed to execute vMix action for ${eventName}:`, error.message);
    }
}

// ==================== NODE WORKFLOW API ====================

// Get current workflow
app.get('/api/workflow', (req, res) => {
    res.json(nodeWorkflow);
});

// Update workflow
app.post('/api/workflow', (req, res) => {
    nodeWorkflow = req.body;
    res.json({ success: true });
});

// Add a node
app.post('/api/nodes', (req, res) => {
    const newNode = req.body;
    nodeWorkflow.nodes.push(newNode);
    res.json({ success: true, node: newNode });
});

// Update a node
app.put('/api/nodes/:id', (req, res) => {
    const nodeId = req.params.id;
    const nodeIndex = nodeWorkflow.nodes.findIndex(n => n.id === nodeId);
    
    if (nodeIndex !== -1) {
        nodeWorkflow.nodes[nodeIndex] = { ...nodeWorkflow.nodes[nodeIndex], ...req.body };
        res.json({ success: true, node: nodeWorkflow.nodes[nodeIndex] });
    } else {
        res.status(404).json({ success: false, error: 'Node not found' });
    }
});

// Delete a node
app.delete('/api/nodes/:id', (req, res) => {
    const nodeId = req.params.id;
    nodeWorkflow.nodes = nodeWorkflow.nodes.filter(n => n.id !== nodeId);
    nodeWorkflow.connections = nodeWorkflow.connections.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId);
    res.json({ success: true });
});

// Add a connection
app.post('/api/connections', (req, res) => {
    const newConnection = req.body;
    nodeWorkflow.connections.push(newConnection);
    res.json({ success: true, connection: newConnection });
});

// Delete a connection
app.delete('/api/connections/:id', (req, res) => {
    const connectionId = req.params.id;
    nodeWorkflow.connections = nodeWorkflow.connections.filter(c => c.id !== connectionId);
    res.json({ success: true });
});

// Test a node (trigger it manually)
app.post('/api/nodes/:id/test', async (req, res) => {
    const nodeId = req.params.id;
    const node = nodeWorkflow.nodes.find(n => n.id === nodeId);
    
    if (!node) {
        return res.status(404).json({ success: false, error: 'Node not found' });
    }
    
    try {
        if (node.type === 'action') {
            await executeVmixAction(node, 'Manual Test');
            res.json({ success: true, message: 'Action executed successfully' });
        } else if (node.type === 'event') {
            // Find connected actions and trigger them
            const connections = nodeWorkflow.connections.filter(c => c.fromNodeId === nodeId);
            for (const connection of connections) {
                const actionNode = nodeWorkflow.nodes.find(n => n.id === connection.toNodeId);
                if (actionNode && actionNode.type === 'action') {
                    await executeVmixAction(actionNode, `Test: ${node.eventType}`);
                }
            }
            res.json({ success: true, message: 'Event tested successfully' });
        } else {
            res.json({ success: false, error: 'Unknown node type' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== PRESET MANAGEMENT ====================

// Get all presets
app.get('/api/presets', (req, res) => {
    const presets = fs.readdirSync(PRESETS_DIR)
        .filter(file => file.endsWith('.json'))
        .map(file => ({
            name: path.basename(file, '.json'),
            filename: file
        }));
    res.json(presets);
});

// Save preset
app.post('/api/presets', (req, res) => {
    const { name, workflow } = req.body;
    
    if (!name) {
        return res.status(400).json({ success: false, error: 'Preset name is required' });
    }
    
    const filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    const filepath = path.join(PRESETS_DIR, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(workflow || nodeWorkflow, null, 2));
    
    res.json({ success: true, filename });
});

// Load preset
app.get('/api/presets/:filename', (req, res) => {
    const filepath = path.join(PRESETS_DIR, req.params.filename);
    
    if (!fs.existsSync(filepath)) {
        return res.status(404).json({ success: false, error: 'Preset not found' });
    }
    
    const workflow = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    res.json(workflow);
});

// Delete preset
app.delete('/api/presets/:filename', (req, res) => {
    const filepath = path.join(PRESETS_DIR, req.params.filename);
    
    if (!fs.existsSync(filepath)) {
        return res.status(404).json({ success: false, error: 'Preset not found' });
    }
    
    fs.unlinkSync(filepath);
    res.json({ success: true });
});

// ==================== GAMESTATE INFO ====================

// Get current gamestate
app.get('/api/gamestate', (req, res) => {
    res.json(currentGameState);
});

// ==================== SERVER START ====================

// Function to try starting server on available port
function startServer(port, maxAttempts = 10) {
    const server = app.listen(port)
        .on('listening', () => {
            console.log('');
            console.log('╔════════════════════════════════════════════════════════╗');
            console.log('║   vNodes - Node-Based vMix Integration v2.0           ║');
            console.log('╚════════════════════════════════════════════════════════╝');
            console.log('');
            if (port !== PORT) {
                console.log(`⚠️  Port ${PORT} was busy, using port ${port} instead`);
            }
            console.log(`🚀 Server running on http://localhost:${port}`);
            console.log(`📺 vMix API: ${VMIX_API_URL}`);
            console.log(`🎯 Node Editor: http://localhost:${port}`);
            console.log(`💾 Presets directory: ${PRESETS_DIR}`);
            console.log('');
            console.log('📡 Waiting for CS:GO gamestate data...');
            console.log('');
        })
        .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                if (maxAttempts > 0) {
                    console.log(`⚠️  Port ${port} is already in use, trying ${port + 1}...`);
                    startServer(port + 1, maxAttempts - 1);
                } else {
                    console.error('❌ Could not find an available port. Please free up ports 8082-8092.');
                    process.exit(1);
                }
            } else {
                console.error('❌ Server error:', err);
                process.exit(1);
            }
        });
}

startServer(PORT);

