// ==================== STATE MANAGEMENT ====================

let state = {
    nodes: [],
    connections: [],
    groups: [],
    selectedNode: null,
    selectedConnection: null,
    selectedGroup: null,
    isDraggingNode: false,
    isDraggingCanvas: false,
    isDraggingGroup: false,
    isConnecting: false,
    connectingFrom: null,
    canvasOffset: { x: 0, y: 0 },
    zoom: 1,
    lastMousePos: { x: 0, y: 0 },
    updateScheduled: false
};

let nodeIdCounter = 1;
let connectionIdCounter = 1;
let groupIdCounter = 1;

// ==================== VMIX FUNCTIONS DATABASE ====================

// vMix Functions organized by category
const VMIX_CATEGORIES = {
    'Audio': ['AudioAutoOff', 'AudioAutoOn', 'AudioOff', 'AudioOn', 'AudioPluginOff', 'AudioPluginOn', 'AudioPluginShow', 'AudioPluginShowHide', 'BusAAudioOff', 'BusAAudioOn', 'BusBAudioOff', 'BusBAudioOn', 'BusCAudioOff', 'BusCAudioOn', 'BusDAudioOff', 'BusDAudioOn', 'BusEAudioOff', 'BusEAudioOn', 'BusFAudioOff', 'BusFAudioOn', 'BusGAudioOff', 'BusGAudioOn', 'MasterAudioOff', 'MasterAudioOn', 'Solo', 'SoloOff', 'SoloOn'],
    'Transition': ['Cut', 'CutDirect', 'Fade', 'FadeToBlack', 'Merge', 'QuickPlay', 'Stinger1', 'Stinger2', 'Stinger3', 'Stinger4', 'Transition1', 'Transition2', 'Transition3', 'Transition4'],
    'Input': ['FullScreen', 'NextPicture', 'PlayPause', 'PreviewInput', 'PreviewInputNext', 'PreviewInputPrevious', 'SelectIndex', 'SetPosition'],
    'Overlay': ['OverlayInput1', 'OverlayInput1In', 'OverlayInput1Off', 'OverlayInput1Out', 'OverlayInput1Zoom', 'OverlayInput2', 'OverlayInput2In', 'OverlayInput2Off', 'OverlayInput2Out', 'OverlayInput2Zoom', 'OverlayInput3', 'OverlayInput3In', 'OverlayInput3Off', 'OverlayInput3Out', 'OverlayInput3Zoom', 'OverlayInput4', 'OverlayInput4In', 'OverlayInput4Off', 'OverlayInput4Out', 'OverlayInput4Zoom'],
    'Output': ['StartStopExternal2', 'StartStopMultiCorder', 'StartStopRecording', 'StartStopStreaming'],
    'Title': ['SetText', 'SetImage', 'TitleBeginAnimation', 'TitlePreset'],
    'Replay': ['ReplayMarkIn', 'ReplayMarkOut', 'ReplayPlay', 'ReplayPlayAll', 'ReplayPlayAllEvents', 'ReplayPlayEvent', 'ReplayPlayLast', 'ReplayRecord', 'ReplaySetSpeed', 'ReplayStartRecording', 'ReplayStartStopRecording', 'ReplayStopRecording', 'ReplayToggleLastEventMode'],
    'Mix': ['ActiveInput', 'LastPreset', 'SetMixPreview', 'SetOutput', 'SetPanX', 'SetPanY', 'SetZoom'],
    'Other': ['CallManager', 'DataSourceAutoNextOff', 'DataSourceAutoNextOn', 'DataSourceNextRow', 'DataSourcePreviousRow', 'DataSourceSelectRow', 'KeyPress', 'SendKeys', 'LayerOff', 'LayerOn', 'MultiViewOverlay', 'ScriptStart', 'ScriptStartDynamic', 'ScriptStop', 'ScriptStopAll', 'SetAlpha', 'SetColor', 'SetCountdown', 'SetDynamicValue1', 'SetDynamicValue2', 'SetDynamicValue3', 'SetDynamicValue4', 'SetFader', 'SetGain', 'SetHeadphonesVolume', 'SetLayer', 'SetMasterVolume', 'SetVolumeFade', 'Sleep', 'StreamingSetKey', 'VideoCallAudioSource', 'VideoCallVideoSource', 'VideoDelayStartStop']
};

const VMIX_FUNCTIONS_DB = {
    // General
    'KeyPress': { params: ['Value'], description: 'Send key press to active window' },
    'SendKeys': { params: ['Value'], description: 'Send keys to active window' },
    
    // Audio
    'Audio': { params: ['Input'], description: 'Toggle Audio Mute On/Off' },
    'AudioOn': { params: ['Input'], description: 'Turn Audio On' },
    'AudioOff': { params: ['Input'], description: 'Turn Audio Off' },
    'AudioAuto': { params: ['Input'], description: 'Auto Audio' },
    'SetVolume': { params: ['Value', 'Input'], description: 'Set volume 0-100' },
    'SetVolumeFade': { params: ['Value', 'Input'], description: 'Set volume gradually (Volume,Milliseconds)' },
    'SetBalance': { params: ['Value', 'Input'], description: 'Set Balance -1 to 1' },
    'SetGain': { params: ['Value', 'Input'], description: 'Set Gain dB 0-24' },
    'MasterAudio': { params: [], description: 'Toggle Master Audio' },
    'MasterAudioOn': { params: [], description: 'Turn Master Audio On' },
    'MasterAudioOff': { params: [], description: 'Turn Master Audio Off' },
    'SetMasterVolume': { params: ['Value'], description: 'Set Master Volume 0-100' },
    'SetMasterVolumeFade': { params: ['Value'], description: 'Set Master Volume Fade (Volume,Milliseconds)' },
    'Solo': { params: ['Input'], description: 'Toggle Solo' },
    'SoloOn': { params: ['Input'], description: 'Solo On' },
    'SoloOff': { params: ['Input'], description: 'Solo Off' },
    
    // Transition
    'Transition1': { params: [], description: 'Transition Button 1' },
    'Transition2': { params: [], description: 'Transition Button 2' },
    'Transition3': { params: [], description: 'Transition Button 3' },
    'Transition4': { params: [], description: 'Transition Button 4' },
    'Cut': { params: ['Input'], description: 'Cut to Input' },
    'Fade': { params: ['Input'], description: 'Fade to Input' },
    'Zoom': { params: ['Input'], description: 'Zoom to Input' },
    'Merge': { params: ['Input'], description: 'Merge to Input' },
    'Wipe': { params: ['Input'], description: 'Wipe to Input' },
    'CutDirect': { params: ['Input'], description: 'Cut directly to Output' },
    'FadeToBlack': { params: [], description: 'Toggle Fade To Black' },
    'SetFader': { params: ['Value'], description: 'Set T-Bar Fader 0-255' },
    'QuickPlay': { params: ['Input'], description: 'Quick Play Input' },
    
    // Input
    'ActiveInput': { params: ['Input', 'Mix'], description: 'Send Input to Output' },
    'PreviewInput': { params: ['Input', 'Mix'], description: 'Send Input to Preview' },
    'Play': { params: ['Input'], description: 'Play' },
    'Pause': { params: ['Input'], description: 'Pause' },
    'PlayPause': { params: ['Input'], description: 'Toggle Play/Pause' },
    'Stop': { params: ['Input'], description: 'Stop' },
    'Restart': { params: ['Input'], description: 'Restart' },
    'NextPicture': { params: ['Input'], description: 'Next Picture/Slide' },
    'PreviousPicture': { params: ['Input'], description: 'Previous Picture/Slide' },
    'Loop': { params: ['Input'], description: 'Toggle Loop' },
    'LoopOn': { params: ['Input'], description: 'Loop On' },
    'LoopOff': { params: ['Input'], description: 'Loop Off' },
    'SetPosition': { params: ['Value', 'Input'], description: 'Set Position in Milliseconds' },
    'SetZoom': { params: ['Value', 'Input'], description: 'Set Zoom 0-5' },
    'SetPanX': { params: ['Value', 'Input'], description: 'Set Pan X -2 to 2' },
    'SetPanY': { params: ['Value', 'Input'], description: 'Set Pan Y -2 to 2' },
    'SetAlpha': { params: ['Value', 'Input'], description: 'Set Alpha 0-255' },
    
    // Overlay
    'OverlayInput1': { params: ['Input', 'Mix'], description: 'Toggle Overlay 1' },
    'OverlayInput1In': { params: ['Input', 'Mix'], description: 'Overlay 1 In' },
    'OverlayInput1Out': { params: [], description: 'Overlay 1 Out' },
    'OverlayInput1Off': { params: [], description: 'Overlay 1 Off' },
    'OverlayInput2': { params: ['Input', 'Mix'], description: 'Toggle Overlay 2' },
    'OverlayInput2In': { params: ['Input', 'Mix'], description: 'Overlay 2 In' },
    'OverlayInput2Out': { params: [], description: 'Overlay 2 Out' },
    'OverlayInput2Off': { params: [], description: 'Overlay 2 Off' },
    'OverlayInput3': { params: ['Input', 'Mix'], description: 'Toggle Overlay 3' },
    'OverlayInput3In': { params: ['Input', 'Mix'], description: 'Overlay 3 In' },
    'OverlayInput3Out': { params: [], description: 'Overlay 3 Out' },
    'OverlayInput3Off': { params: [], description: 'Overlay 3 Off' },
    'OverlayInput4': { params: ['Input', 'Mix'], description: 'Toggle Overlay 4' },
    'OverlayInput4In': { params: ['Input', 'Mix'], description: 'Overlay 4 In' },
    'OverlayInput4Out': { params: [], description: 'Overlay 4 Out' },
    'OverlayInput4Off': { params: [], description: 'Overlay 4 Off' },
    
    // Output
    'StartRecording': { params: [], description: 'Start Recording' },
    'StopRecording': { params: [], description: 'Stop Recording' },
    'StartStopRecording': { params: [], description: 'Toggle Recording' },
    'StartStreaming': { params: ['Value'], description: 'Start Streaming (optional stream #)' },
    'StopStreaming': { params: ['Value'], description: 'Stop Streaming (optional stream #)' },
    'StartStopStreaming': { params: ['Value'], description: 'Toggle Streaming (optional stream #)' },
    'Fullscreen': { params: [], description: 'Toggle Fullscreen' },
    'FullscreenOn': { params: [], description: 'Fullscreen On' },
    'FullscreenOff': { params: [], description: 'Fullscreen Off' },
    
    // Title
    'SetText': { params: ['Value', 'Input'], description: 'Set Text (use SelectedIndex or SelectedName)' },
    'SetImage': { params: ['Value', 'Input'], description: 'Set Image (use SelectedIndex or SelectedName)' },
    'SetColor': { params: ['Value', 'Input'], description: 'Set Color HTML #xxxxxxxx' },
    'StartCountdown': { params: ['Input'], description: 'Start Countdown' },
    'StopCountdown': { params: ['Input'], description: 'Stop Countdown' },
    'PauseCountdown': { params: ['Input'], description: 'Pause Countdown' },
    'SetCountdown': { params: ['Value', 'Input'], description: 'Set Countdown (hh:mm:ss)' },
    
    // Replay
    'ReplayMarkIn': { params: [], description: 'Mark In Point' },
    'ReplayMarkOut': { params: [], description: 'Mark Out Point' },
    'ReplayPlay': { params: ['Channel'], description: 'Replay Play' },
    'ReplayPause': { params: ['Channel'], description: 'Replay Pause' },
    'ReplayPlayLastEvent': { params: ['Channel'], description: 'Play Last Event' },
    'ReplayLive': { params: [], description: 'Replay Live' },
    'ReplayStartRecording': { params: [], description: 'Start Replay Recording' },
    'ReplayStopRecording': { params: [], description: 'Stop Replay Recording' }
};

// Legacy array for backward compatibility
const VMIX_FUNCTIONS = Object.keys(VMIX_FUNCTIONS_DB);


// ==================== EVENT LABELS ====================

const EVENT_LABELS = {
    'timeout_started': { label: '⏱️ Timeout Started', icon: '⏱️' },
    'timeout_over': { label: '⏱️ Timeout Over', icon: '⏱️' },
    'round_started': { label: '🎮 Round Started', icon: '🎮' },
    'round_concluded': { label: '🎮 Round Over', icon: '🎮' },
    'freeze_time_started': { label: '❄️ Freeze Time', icon: '❄️' },
    'freeze_time_over': { label: '❄️ Freeze Over', icon: '❄️' },
    'warmup_started': { label: '🔥 Warmup Started', icon: '🔥' },
    'warmup_over': { label: '🔥 Warmup Over', icon: '🔥' },
    'match_started': { label: '🏁 Match Started', icon: '🏁' },
    'gameover': { label: '🏁 Game Over', icon: '🏁' },
    'bomb_planted': { label: '💣 Bomb Planted', icon: '💣' },
    'bomb_defused': { label: '💣 Bomb Defused', icon: '💣' },
    'bomb_exploded': { label: '💣 Bomb Exploded', icon: '💣' },
    'player_died': { label: '💀 Player Died', icon: '💀' },
    'player_spawned': { label: '👤 Player Spawned', icon: '👤' }
};

const VMIX_TRIGGER_LABELS = {
    'OnTransitionIn': { label: '➡️ On Transition In', icon: '➡️' },
    'OnTransitionOut': { label: '⬅️ On Transition Out', icon: '⬅️' },
    'OnPreviewIn': { label: '👁️ On Preview In', icon: '👁️' },
    'OnPreviewOut': { label: '🚫 On Preview Out', icon: '🚫' },
    'OnOverlay1In': { label: '🔷 Overlay 1 In', icon: '🔷' },
    'OnOverlay1Out': { label: '🔷 Overlay 1 Out', icon: '🔷' },
    'OnOverlay2In': { label: '🔶 Overlay 2 In', icon: '🔶' },
    'OnOverlay2Out': { label: '🔶 Overlay 2 Out', icon: '🔶' },
    'OnOverlay3In': { label: '🔸 Overlay 3 In', icon: '🔸' },
    'OnOverlay3Out': { label: '🔸 Overlay 3 Out', icon: '🔸' },
    'OnOverlay4In': { label: '🔹 Overlay 4 In', icon: '🔹' },
    'OnOverlay4Out': { label: '🔹 Overlay 4 Out', icon: '🔹' },
    'OnRecordingStart': { label: '🔴 Recording Start', icon: '🔴' },
    'OnRecordingStop': { label: '⏹️ Recording Stop', icon: '⏹️' },
    'OnStreamingStart': { label: '📡 Streaming Start', icon: '📡' },
    'OnStreamingStop': { label: '📡 Streaming Stop', icon: '📡' }
};

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    loadWorkflow();
    loadPresets();
    updateStatusDisplay();
});

// ==================== EVENT LISTENERS ====================

function initEventListeners() {
    // Collapsible sections
    document.querySelectorAll('.section-header.collapsible').forEach(header => {
        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
            const section = header.parentElement;
            const content = section.querySelector('.node-palette, .preset-controls, .status-info');
            if (content) {
                content.classList.toggle('collapsed');
            }
        });
    });

    // Palette node drag
    document.querySelectorAll('.palette-node').forEach(btn => {
        btn.addEventListener('click', () => createNodeFromPalette(btn));
    });

    // Group creation
    document.getElementById('createGroupBtn').addEventListener('click', createGroup);
    document.getElementById('createGroupToolbar').addEventListener('click', createGroup);

    // Canvas panning
    const canvas = document.getElementById('canvas');
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('wheel', handleCanvasWheel);

    // Toolbar
    document.getElementById('zoomIn').addEventListener('click', () => setZoom(state.zoom + 0.1));
    document.getElementById('zoomOut').addEventListener('click', () => setZoom(state.zoom - 0.1));
    document.getElementById('resetZoom').addEventListener('click', () => setZoom(1));
    document.getElementById('centerView').addEventListener('click', centerView);

    // Presets
    document.getElementById('savePreset').addEventListener('click', savePreset);
    document.getElementById('clearWorkflow').addEventListener('click', clearWorkflow);

    // Modal
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('saveConfig').addEventListener('click', saveNodeConfig);
    document.getElementById('deleteNode').addEventListener('click', deleteCurrentNode);
    document.getElementById('testNode').addEventListener('click', testCurrentNode);

    // Click outside modal to close
    document.getElementById('configModal').addEventListener('click', (e) => {
        if (e.target.id === 'configModal') closeModal();
    });
}

// ==================== NODE CREATION ====================

function createNodeFromPalette(paletteBtn) {
    const nodeType = paletteBtn.dataset.nodeType;
    const eventType = paletteBtn.dataset.eventType;
    const triggerType = paletteBtn.dataset.triggerType;

    const node = {
        id: `node_${nodeIdCounter++}`,
        type: nodeType,
        position: {
            x: 400 + Math.random() * 200,
            y: 200 + Math.random() * 200
        }
    };

    if (nodeType === 'event') {
        node.eventType = eventType;
        node.label = EVENT_LABELS[eventType]?.label || eventType;
        node.icon = EVENT_LABELS[eventType]?.icon || '📥';
    } else if (nodeType === 'vmix-trigger') {
        node.triggerType = triggerType;
        node.config = { targetInput: '' };
        node.label = VMIX_TRIGGER_LABELS[triggerType]?.label || triggerType;
        node.icon = VMIX_TRIGGER_LABELS[triggerType]?.icon || '🎯';
    } else if (nodeType === 'action') {
        node.config = {
            actionSequence: []
        };
        node.label = '🎬 vMix Action';
        node.icon = '📤';
    }

    state.nodes.push(node);
    renderNode(node);
    saveWorkflow();
    updateStatusDisplay();
}

// ==================== GROUP CREATION ====================

function createGroup() {
    const group = {
        id: `group_${groupIdCounter++}`,
        name: `Group ${groupIdCounter - 1}`,
        position: {
            x: 300 + Math.random() * 200,
            y: 150 + Math.random() * 200
        },
        width: 400,
        height: 300,
        collapsed: false,
        children: [] // Array of node IDs
    };

    state.groups.push(group);
    renderGroup(group);
    saveWorkflow();
    updateStatusDisplay();
}

function renderGroup(group) {
    const groupEl = document.createElement('div');
    groupEl.className = 'group-container' + (group.collapsed ? ' collapsed' : '');
    groupEl.id = `group-${group.id}`;
    groupEl.style.left = `${group.position.x}px`;
    groupEl.style.top = `${group.position.y}px`;
    groupEl.style.width = `${group.width}px`;
    groupEl.style.height = group.collapsed ? '40px' : `${group.height}px`;

    const childCount = group.children.length;
    const childCountText = childCount > 0 ? ` (${childCount})` : '';

    groupEl.innerHTML = `
        <div class="group-header">
            <button class="group-collapse-btn">${group.collapsed ? '▶' : '▼'}</button>
            <input type="text" class="group-name-input" value="${group.name}" />
            <span class="group-count">${childCountText}</span>
            <button class="group-delete-btn" title="Delete group (keeps contents)">×</button>
        </div>
        <div class="group-body" style="display: ${group.collapsed ? 'none' : 'block'}">
        </div>
        <div class="group-resize-edges" style="display: ${group.collapsed ? 'none' : 'block'}">
            <div class="resize-edge resize-n"></div>
            <div class="resize-edge resize-e"></div>
            <div class="resize-edge resize-s"></div>
            <div class="resize-edge resize-w"></div>
            <div class="resize-corner resize-nw"></div>
            <div class="resize-corner resize-ne"></div>
            <div class="resize-corner resize-sw"></div>
            <div class="resize-corner resize-se"></div>
        </div>
    `;

    // Group header drag
    const header = groupEl.querySelector('.group-header');
    header.addEventListener('mousedown', (e) => {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
            handleGroupMouseDown(e, group);
        }
    });

    // Group name editing
    const nameInput = groupEl.querySelector('.group-name-input');
    nameInput.addEventListener('change', (e) => {
        group.name = e.target.value;
        saveWorkflow();
    });
    nameInput.addEventListener('click', (e) => e.stopPropagation());

    // Collapse button
    const collapseBtn = groupEl.querySelector('.group-collapse-btn');
    collapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleGroupCollapse(group);
    });

    // Delete button
    const deleteBtn = groupEl.querySelector('.group-delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteGroup(group);
    });

    // Resize handles - edges and corners
    const resizeHandles = groupEl.querySelectorAll('.resize-edge, .resize-corner');
    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            const direction = handle.className.split(' ')[1].replace('resize-', '');
            handleGroupResize(e, group, direction);
        });
    });

    document.getElementById('nodes-container').appendChild(groupEl);
}

// ==================== NODE RENDERING ====================

function renderNode(node) {
    const nodeEl = document.createElement('div');
    nodeEl.className = `node ${node.type}-type`;
    nodeEl.id = `node-${node.id}`;
    nodeEl.style.left = `${node.position.x}px`;
    nodeEl.style.top = `${node.position.y}px`;

    const label = node.label || (node.type === 'event' ? node.eventType : 'Action');
    const icon = node.icon || (node.type === 'event' ? '📥' : '📤');

    nodeEl.innerHTML = `
        <div class="node-header">
            <span class="node-title">${label}</span>
            <span class="node-icon">${icon}</span>
        </div>
        <div class="node-body">
            ${renderNodeBody(node)}
        </div>
        ${(node.type === 'event' || node.type === 'vmix-trigger') ? '<div class="node-port output"></div>' : ''}
        ${node.type === 'action' ? '<div class="node-port input"></div>' : ''}
    `;

    // Node interaction events
    nodeEl.addEventListener('mousedown', (e) => handleNodeMouseDown(e, node));
    nodeEl.addEventListener('dblclick', () => openNodeConfig(node));

    // Port interaction events
    const outputPort = nodeEl.querySelector('.node-port.output');
    const inputPort = nodeEl.querySelector('.node-port.input');

    if (outputPort) {
        outputPort.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            startConnection(node);
        });
    }

    if (inputPort) {
        inputPort.addEventListener('mouseup', (e) => {
            e.stopPropagation();
            if (state.isConnecting && state.connectingFrom) {
                completeConnection(node);
            }
        });
    }

    document.getElementById('nodes-container').appendChild(nodeEl);
}

function renderNodeBody(node) {
    if (node.type === 'event') {
        return `<div class="node-info">Triggers when: ${node.eventType}</div>`;
    } else if (node.type === 'vmix-trigger') {
        const config = node.config || {};
        const targetText = config.targetInput ? ` for Input: ${config.targetInput}` : ' (any input)';
        return `<div class="node-info">Triggers ${node.triggerType}${targetText}</div>`;
    } else if (node.type === 'action') {
        const config = node.config || {};
        const actionSequence = config.actionSequence || [];
        
        if (actionSequence.length === 0) {
            return `<div class="node-info" style="color: var(--text-secondary); font-style: italic;">No actions configured</div>`;
        }
        
        // Show first 3 actions
        const preview = actionSequence.slice(0, 3).map((action, i) => {
            const delay = parseInt(action.delay) || 0;
            const delayText = delay > 0 ? `⏱️ ${delay}ms → ` : '';
            return `<div class="node-config-item">
                <div class="node-config-label">${i + 1}. ${delayText}${action.function}</div>
                <div class="node-config-value">${action.input || '—'}</div>
            </div>`;
        }).join('');
        
        const more = actionSequence.length > 3 ? 
            `<div class="node-config-item" style="font-style: italic; color: var(--text-secondary);">
                <div class="node-config-label">+ ${actionSequence.length - 3} more...</div>
            </div>` : '';
        
        return `<div class="node-info">${preview}${more}</div>`;
    }
    return '';
}

function renderAllNodes() {
    document.getElementById('nodes-container').innerHTML = '';
    state.groups.forEach(renderGroup);
    state.nodes.forEach(renderNode);
}

// ==================== NODE DRAGGING ====================

let draggedNode = null;
let dragOffset = { x: 0, y: 0 };

function handleNodeMouseDown(e, node) {
    if (e.target.closest('.node-port')) return;
    
    e.stopPropagation();
    draggedNode = node;
    state.selectedNode = node;
    
    const nodeEl = document.getElementById(`node-${node.id}`);
    const rect = nodeEl.getBoundingClientRect();
    const containerRect = document.getElementById('canvas-container').getBoundingClientRect();
    
    // Calculate offset accounting for zoom and pan
    const mouseX = (e.clientX - containerRect.left - state.canvasOffset.x) / state.zoom;
    const mouseY = (e.clientY - containerRect.top - state.canvasOffset.y) / state.zoom;
    
    dragOffset.x = mouseX - node.position.x;
    dragOffset.y = mouseY - node.position.y;

    // Add selected class
    document.querySelectorAll('.node').forEach(n => n.classList.remove('selected'));
    nodeEl.classList.add('selected');

    document.addEventListener('mousemove', handleNodeDrag);
    document.addEventListener('mouseup', handleNodeDragEnd);
}

function handleNodeDrag(e) {
    if (!draggedNode) return;

    const containerRect = document.getElementById('canvas-container').getBoundingClientRect();
    
    // Account for zoom and pan
    const x = (e.clientX - containerRect.left - state.canvasOffset.x) / state.zoom;
    const y = (e.clientY - containerRect.top - state.canvasOffset.y) / state.zoom;
    
    draggedNode.position.x = x - dragOffset.x / state.zoom;
    draggedNode.position.y = y - dragOffset.y / state.zoom;

    const nodeEl = document.getElementById(`node-${draggedNode.id}`);
    nodeEl.style.left = `${draggedNode.position.x}px`;
    nodeEl.style.top = `${draggedNode.position.y}px`;

    // Use requestAnimationFrame for smooth connection updates
    if (!state.updateScheduled) {
        state.updateScheduled = true;
        requestAnimationFrame(() => {
            renderConnections();
            state.updateScheduled = false;
        });
    }
}

function handleNodeDragEnd() {
    if (draggedNode) {
        // Check if node should be added to any group
        checkNodeGroupAssignment(draggedNode);
        saveWorkflow();
    }
    draggedNode = null;
    document.removeEventListener('mousemove', handleNodeDrag);
    document.removeEventListener('mouseup', handleNodeDragEnd);
}

// ==================== GROUP INTERACTIONS ====================

let draggedGroup = null;
let groupDragOffset = { x: 0, y: 0 };
let resizingGroup = null;
let resizeDirection = '';
let resizeStartSize = { width: 0, height: 0 };
let resizeStartPos = { x: 0, y: 0 };
let resizeStartMouse = { x: 0, y: 0 };

function handleGroupMouseDown(e, group) {
    e.stopPropagation();
    draggedGroup = group;
    state.selectedGroup = group;
    
    const groupEl = document.getElementById(`group-${group.id}`);
    const rect = groupEl.getBoundingClientRect();
    const containerRect = document.getElementById('canvas-container').getBoundingClientRect();
    
    // Calculate offset accounting for zoom and pan
    const mouseX = (e.clientX - containerRect.left - state.canvasOffset.x) / state.zoom;
    const mouseY = (e.clientY - containerRect.top - state.canvasOffset.y) / state.zoom;
    
    groupDragOffset.x = mouseX - group.position.x;
    groupDragOffset.y = mouseY - group.position.y;

    // Add selected class
    document.querySelectorAll('.group-container').forEach(g => g.classList.remove('selected'));
    groupEl.classList.add('selected');

    document.addEventListener('mousemove', handleGroupDrag);
    document.addEventListener('mouseup', handleGroupDragEnd);
}

function handleGroupDrag(e) {
    if (!draggedGroup) return;

    const containerRect = document.getElementById('canvas-container').getBoundingClientRect();
    
    // Account for zoom and pan
    const x = (e.clientX - containerRect.left - state.canvasOffset.x) / state.zoom;
    const y = (e.clientY - containerRect.top - state.canvasOffset.y) / state.zoom;
    
    const deltaX = x - groupDragOffset.x - draggedGroup.position.x;
    const deltaY = y - groupDragOffset.y - draggedGroup.position.y;
    
    draggedGroup.position.x = x - groupDragOffset.x;
    draggedGroup.position.y = y - groupDragOffset.y;

    const groupEl = document.getElementById(`group-${draggedGroup.id}`);
    groupEl.style.left = `${draggedGroup.position.x}px`;
    groupEl.style.top = `${draggedGroup.position.y}px`;

    // Move all child nodes with the group
    draggedGroup.children.forEach(nodeId => {
        const node = state.nodes.find(n => n.id === nodeId);
        if (node) {
            node.position.x += deltaX;
            node.position.y += deltaY;
            const nodeEl = document.getElementById(`node-${node.id}`);
            if (nodeEl) {
                nodeEl.style.left = `${node.position.x}px`;
                nodeEl.style.top = `${node.position.y}px`;
            }
        }
    });

    // Update connections
    if (!state.updateScheduled) {
        state.updateScheduled = true;
        requestAnimationFrame(() => {
            renderConnections();
            state.updateScheduled = false;
        });
    }
}

function handleGroupDragEnd() {
    if (draggedGroup) {
        saveWorkflow();
    }
    draggedGroup = null;
    document.removeEventListener('mousemove', handleGroupDrag);
    document.removeEventListener('mouseup', handleGroupDragEnd);
}

function handleGroupResize(e, group, direction) {
    e.stopPropagation();
    resizingGroup = group;
    resizeDirection = direction;
    
    const containerRect = document.getElementById('canvas-container').getBoundingClientRect();
    resizeStartMouse.x = (e.clientX - containerRect.left - state.canvasOffset.x) / state.zoom;
    resizeStartMouse.y = (e.clientY - containerRect.top - state.canvasOffset.y) / state.zoom;
    resizeStartSize.width = group.width;
    resizeStartSize.height = group.height;
    resizeStartPos.x = group.position.x;
    resizeStartPos.y = group.position.y;

    document.addEventListener('mousemove', handleGroupResizeDrag);
    document.addEventListener('mouseup', handleGroupResizeEnd);
}

function handleGroupResizeDrag(e) {
    if (!resizingGroup) return;

    if (!state.updateScheduled) {
        state.updateScheduled = true;
        requestAnimationFrame(() => {
            const containerRect = document.getElementById('canvas-container').getBoundingClientRect();
            const mouseX = (e.clientX - containerRect.left - state.canvasOffset.x) / state.zoom;
            const mouseY = (e.clientY - containerRect.top - state.canvasOffset.y) / state.zoom;
            
            const deltaX = mouseX - resizeStartMouse.x;
            const deltaY = mouseY - resizeStartMouse.y;
            
            const groupEl = document.getElementById(`group-${resizingGroup.id}`);
            
            // Handle different resize directions
            if (resizeDirection.includes('e')) {
                resizingGroup.width = Math.max(200, resizeStartSize.width + deltaX);
            }
            if (resizeDirection.includes('w')) {
                const newWidth = Math.max(200, resizeStartSize.width - deltaX);
                const widthDiff = newWidth - resizingGroup.width;
                resizingGroup.width = newWidth;
                resizingGroup.position.x = resizeStartPos.x - deltaX;
                groupEl.style.left = `${resizingGroup.position.x}px`;
                
                // Move child nodes with the group
                if (widthDiff !== 0) {
                    resizingGroup.children.forEach(nodeId => {
                        const node = state.nodes.find(n => n.id === nodeId);
                        if (node) {
                            const nodeEl = document.getElementById(`node-${node.id}`);
                            if (nodeEl) {
                                nodeEl.style.left = `${node.position.x}px`;
                            }
                        }
                    });
                }
            }
            if (resizeDirection.includes('s')) {
                resizingGroup.height = Math.max(150, resizeStartSize.height + deltaY);
            }
            if (resizeDirection.includes('n')) {
                const newHeight = Math.max(150, resizeStartSize.height - deltaY);
                const heightDiff = newHeight - resizingGroup.height;
                resizingGroup.height = newHeight;
                resizingGroup.position.y = resizeStartPos.y - deltaY;
                groupEl.style.top = `${resizingGroup.position.y}px`;
                
                // Move child nodes with the group
                if (heightDiff !== 0) {
                    resizingGroup.children.forEach(nodeId => {
                        const node = state.nodes.find(n => n.id === nodeId);
                        if (node) {
                            const nodeEl = document.getElementById(`node-${node.id}`);
                            if (nodeEl) {
                                nodeEl.style.top = `${node.position.y}px`;
                            }
                        }
                    });
                }
            }

            groupEl.style.width = `${resizingGroup.width}px`;
            if (!resizingGroup.collapsed) {
                groupEl.style.height = `${resizingGroup.height}px`;
            }
            
            renderConnections();
            state.updateScheduled = false;
        });
    }
}

function handleGroupResizeEnd() {
    if (resizingGroup) {
        saveWorkflow();
    }
    resizingGroup = null;
    resizeDirection = '';
    document.removeEventListener('mousemove', handleGroupResizeDrag);
    document.removeEventListener('mouseup', handleGroupResizeEnd);
}

function toggleGroupCollapse(group) {
    group.collapsed = !group.collapsed;
    
    const groupEl = document.getElementById(`group-${group.id}`);
    const collapseBtn = groupEl.querySelector('.group-collapse-btn');
    const groupBody = groupEl.querySelector('.group-body');
    
    collapseBtn.textContent = group.collapsed ? '▶' : '▼';
    groupBody.style.display = group.collapsed ? 'none' : 'block';
    groupEl.style.height = group.collapsed ? '40px' : `${group.height}px`;
    groupEl.classList.toggle('collapsed', group.collapsed);

    // Hide/show child nodes
    group.children.forEach(nodeId => {
        const nodeEl = document.getElementById(`node-${nodeId}`);
        if (nodeEl) {
            nodeEl.style.display = group.collapsed ? 'none' : 'block';
        }
    });

    renderConnections();
    saveWorkflow();
}

function deleteGroup(group) {
    // Remove group but keep all child nodes
    const index = state.groups.findIndex(g => g.id === group.id);
    if (index !== -1) {
        state.groups.splice(index, 1);
    }

    const groupEl = document.getElementById(`group-${group.id}`);
    if (groupEl) {
        groupEl.remove();
    }

    saveWorkflow();
    updateStatusDisplay();
}

function checkNodeGroupAssignment(node) {
    // Check if node is now inside any group
    const nodeX = node.position.x;
    const nodeY = node.position.y;

    // First, remove from any existing group
    state.groups.forEach(group => {
        const index = group.children.indexOf(node.id);
        if (index !== -1) {
            group.children.splice(index, 1);
            updateGroupChildCount(group);
        }
    });

    // Then check if it's in a new group
    for (const group of state.groups) {
        if (group.collapsed) continue; // Can't add to collapsed groups
        
        const inBounds = nodeX >= group.position.x && 
                        nodeX <= group.position.x + group.width &&
                        nodeY >= group.position.y + 40 && // Account for header
                        nodeY <= group.position.y + group.height;

        if (inBounds) {
            if (!group.children.includes(node.id)) {
                group.children.push(node.id);
                updateGroupChildCount(group);
            }
            break; // Only add to first matching group
        }
    }
}

function updateGroupChildCount(group) {
    const groupEl = document.getElementById(`group-${group.id}`);
    if (groupEl) {
        const countEl = groupEl.querySelector('.group-count');
        const childCount = group.children.length;
        countEl.textContent = childCount > 0 ? ` (${childCount})` : '';
    }
}

// ==================== CONNECTIONS ====================

function startConnection(fromNode) {
    state.isConnecting = true;
    state.connectingFrom = fromNode;

    const tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tempLine.id = 'temp-connection';
    tempLine.classList.add('connection-line');
    document.getElementById('connections').appendChild(tempLine);

    document.addEventListener('mousemove', updateTempConnection);
    document.addEventListener('mouseup', cancelConnection);
}

function updateTempConnection(e) {
    if (!state.isConnecting) return;

    const tempLine = document.getElementById('temp-connection');
    if (!tempLine) return;

    const fromNodeEl = document.getElementById(`node-${state.connectingFrom.id}`);
    const fromPort = fromNodeEl.querySelector('.node-port.output');
    const fromRect = fromPort.getBoundingClientRect();
    const containerRect = document.getElementById('canvas-container').getBoundingClientRect();

    const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
    const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
    const x2 = e.clientX - containerRect.left;
    const y2 = e.clientY - containerRect.top;

    tempLine.setAttribute('d', createConnectionPath(x1, y1, x2, y2));
}

function completeConnection(toNode) {
    if (!state.isConnecting || !state.connectingFrom) return;
    if (toNode.type !== 'action') return;
    if (state.connectingFrom.id === toNode.id) return;

    // Check if connection already exists
    const exists = state.connections.some(c => 
        c.fromNodeId === state.connectingFrom.id && c.toNodeId === toNode.id
    );

    if (!exists) {
        const connection = {
            id: `conn_${connectionIdCounter++}`,
            fromNodeId: state.connectingFrom.id,
            toNodeId: toNode.id
        };
        state.connections.push(connection);
        saveWorkflow();
    }

    cancelConnection();
    renderConnections();
    updateStatusDisplay();
}

function cancelConnection() {
    state.isConnecting = false;
    state.connectingFrom = null;

    const tempLine = document.getElementById('temp-connection');
    if (tempLine) tempLine.remove();

    document.removeEventListener('mousemove', updateTempConnection);
    document.removeEventListener('mouseup', cancelConnection);
}

function renderConnections() {
    const connectionsGroup = document.getElementById('connections');
    connectionsGroup.innerHTML = '';

    state.connections.forEach(connection => {
        const fromNode = state.nodes.find(n => n.id === connection.fromNodeId);
        const toNode = state.nodes.find(n => n.id === connection.toNodeId);

        if (!fromNode || !toNode) return;

        const fromNodeEl = document.getElementById(`node-${fromNode.id}`);
        const toNodeEl = document.getElementById(`node-${toNode.id}`);

        if (!fromNodeEl || !toNodeEl) return;

        const fromPort = fromNodeEl.querySelector('.node-port.output');
        const toPort = toNodeEl.querySelector('.node-port.input');

        const fromRect = fromPort.getBoundingClientRect();
        const toRect = toPort.getBoundingClientRect();
        const containerRect = document.getElementById('canvas-container').getBoundingClientRect();

        const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
        const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
        const x2 = toRect.left + toRect.width / 2 - containerRect.left;
        const y2 = toRect.top + toRect.height / 2 - containerRect.top;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('connection-line');
        path.setAttribute('d', createConnectionPath(x1, y1, x2, y2));
        path.dataset.connectionId = connection.id;

        path.addEventListener('click', () => selectConnection(connection));
        path.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (confirm('Delete this connection?')) {
                deleteConnection(connection.id);
            }
        });

        connectionsGroup.appendChild(path);
    });
}

function createConnectionPath(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const curve = Math.abs(dx) * 0.5;
    return `M ${x1} ${y1} C ${x1 + curve} ${y1}, ${x2 - curve} ${y2}, ${x2} ${y2}`;
}

function updateConnections() {
    renderConnections();
}

function selectConnection(connection) {
    state.selectedConnection = connection;
    document.querySelectorAll('.connection-line').forEach(line => {
        line.classList.toggle('selected', line.dataset.connectionId === connection.id);
    });
}

function deleteConnection(connectionId) {
    state.connections = state.connections.filter(c => c.id !== connectionId);
    saveWorkflow();
    renderConnections();
    updateStatusDisplay();
}

// ==================== CANVAS INTERACTION ====================

let isPanning = false;
let panStart = { x: 0, y: 0 };

function handleCanvasMouseDown(e) {
    if (e.target.id === 'canvas' || e.target.tagName === 'rect') {
        isPanning = true;
        panStart = { x: e.clientX - state.canvasOffset.x, y: e.clientY - state.canvasOffset.y };
        document.getElementById('canvas').classList.add('panning');
    }
}

function handleCanvasMouseMove(e) {
    if (isPanning) {
        state.canvasOffset.x = e.clientX - panStart.x;
        state.canvasOffset.y = e.clientY - panStart.y;
        updateCanvasTransform();
        
        // Update connections while panning
        if (!state.updateScheduled) {
            state.updateScheduled = true;
            requestAnimationFrame(() => {
                renderConnections();
                state.updateScheduled = false;
            });
        }
    }
}

function handleCanvasMouseUp() {
    isPanning = false;
    document.getElementById('canvas').classList.remove('panning');
}

function handleCanvasWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom(state.zoom + delta);
}

function updateCanvasTransform() {
    const nodesContainer = document.getElementById('nodes-container');
    nodesContainer.style.transform = `translate(${state.canvasOffset.x}px, ${state.canvasOffset.y}px) scale(${state.zoom})`;
    
    document.getElementById('panInfo').textContent = `Pan: ${Math.round(state.canvasOffset.x)}, ${Math.round(state.canvasOffset.y)}`;
}

function setZoom(newZoom) {
    state.zoom = Math.max(0.2, Math.min(2, newZoom));
    updateCanvasTransform();
    document.getElementById('zoomLevel').textContent = `${Math.round(state.zoom * 100)}%`;
    renderConnections();
}

function centerView() {
    state.canvasOffset = { x: 0, y: 0 };
    setZoom(1);
}

// ==================== NODE CONFIGURATION ====================

function openNodeConfig(node) {
    state.selectedNode = node;
    const modal = document.getElementById('configModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (node.type === 'event') {
        modalTitle.textContent = `Event: ${node.label}`;
        modalBody.innerHTML = `
            <div class="node-info" style="padding: 20px; text-align: center; background: var(--bg-tertiary); border-radius: 4px;">
                <div style="font-size: 48px; margin-bottom: 16px;">${node.icon}</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${node.label}</div>
                <div style="font-size: 14px; color: var(--text-secondary);">
                    This event triggers when: <strong>${node.eventType}</strong>
                </div>
            </div>
        `;
    } else if (node.type === 'action') {
        const config = node.config || {};
        const actionSequence = config.actionSequence || [];
        
        modalTitle.textContent = 'Configure vMix Action Sequence';
        modalBody.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="font-size: 14px; margin: 0; color: var(--text-secondary);">🎬 Action Sequence</h4>
                    <button id="addAction" class="btn-primary" style="padding: 6px 12px; font-size: 12px;">➕ Add Action</button>
                </div>
                <div id="actionSequenceList" style="display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto;">
                    ${actionSequence.length === 0 ? '<div style="padding: 20px; text-align: center; color: var(--text-secondary); background: var(--bg-tertiary); border-radius: 4px;">No actions yet. Click "Add Action" to start building your sequence.</div>' : ''}
                </div>
            </div>
        `;
        
        // Render existing actions
        actionSequence.forEach((action, index) => renderActionItem(action, index));
        
        // Add action button event
        document.getElementById('addAction').addEventListener('click', () => {
            const newAction = {
                delay: 0,
                function: 'PlayPause',
                input: '',
                value: '',
                duration: '',
                mix: '',
                transition: '',
                selectedIndex: ''
            };
            actionSequence.push(newAction);
            renderActionItem(newAction, actionSequence.length - 1);
        });
    } else if (node.type === 'vmix-trigger') {
        const config = node.config || {};
        modalTitle.textContent = `vMix Trigger: ${node.label}`;
        modalBody.innerHTML = `
            <div style="padding: 20px; text-align: center; background: var(--bg-tertiary); border-radius: 4px; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">${node.icon}</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${node.label}</div>
                <div style="font-size: 14px; color: var(--text-secondary);">
                    This trigger activates when: <strong>${node.triggerType}</strong>
                </div>
            </div>
            
            <div class="form-group">
                <label>🎯 Target Input (Optional)</label>
                <input type="text" id="targetInput" value="${config.targetInput || ''}" placeholder="e.g., 1, camera-1, or leave empty for any">
                <small>Specify a specific input to watch, or leave empty to trigger on any input change</small>
            </div>
            
            <div style="padding: 16px; background: var(--bg-tertiary); border-radius: 4px; border-left: 3px solid var(--accent-green);">
                <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
                    <strong>How it works:</strong>
                </div>
                <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                    ${getVmixTriggerHelp(node.triggerType)}
                </div>
            </div>
        `;
    }

    modal.classList.add('active');
}

function getVmixTriggerHelp(triggerType) {
    const help = {
        'OnTransitionIn': 'Triggers when an input transitions to active (program). If target input is specified, only triggers for that input.',
        'OnTransitionOut': 'Triggers when an input leaves active state. If target input is specified, only triggers for that input.',
        'OnPreviewIn': 'Triggers when an input is selected in preview. If target input is specified, only triggers for that input.',
        'OnPreviewOut': 'Triggers when an input leaves preview. If target input is specified, only triggers for that input.',
        'OnOverlay1In': 'Triggers when an input appears in Overlay 1. If target input is specified, only triggers for that input.',
        'OnOverlay1Out': 'Triggers when Overlay 1 is cleared. If target input is specified, only triggers when that input is removed.',
        'OnOverlay2In': 'Triggers when an input appears in Overlay 2.',
        'OnOverlay2Out': 'Triggers when Overlay 2 is cleared.',
        'OnOverlay3In': 'Triggers when an input appears in Overlay 3.',
        'OnOverlay3Out': 'Triggers when Overlay 3 is cleared.',
        'OnOverlay4In': 'Triggers when an input appears in Overlay 4.',
        'OnOverlay4Out': 'Triggers when Overlay 4 is cleared.',
        'OnRecordingStart': 'Triggers when recording starts in vMix.',
        'OnRecordingStop': 'Triggers when recording stops in vMix.',
        'OnStreamingStart': 'Triggers when streaming starts in vMix.',
        'OnStreamingStop': 'Triggers when streaming stops in vMix.'
    };
    return help[triggerType] || 'Triggers based on vMix state changes.';
}

function renderActionItem(action, index) {
    const container = document.getElementById('actionSequenceList');
    const actionId = `action-${index}`;
    
    // Remove placeholder if exists
    const placeholder = container.querySelector('div[style*="No actions yet"]');
    if (placeholder) placeholder.remove();
    
    const functionInfo = VMIX_FUNCTIONS_DB[action.function] || { params: [], description: '' };
    const hasInput = functionInfo.params.includes('Input');
    const hasValue = functionInfo.params.includes('Value');
    const hasMix = functionInfo.params.includes('Mix');
    const hasChannel = functionInfo.params.includes('Channel');
    const hasDuration = functionInfo.params.includes('Duration');
    
    const actionEl = document.createElement('div');
    actionEl.id = actionId;
    actionEl.className = 'action-item';
    actionEl.style.cssText = 'background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px; padding: 16px;';
    
    actionEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; color: var(--accent-blue);">#${index + 1}</span>
                <button class="move-up" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px;" ${index === 0 ? 'disabled' : ''}>▲</button>
                <button class="move-down" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px;">▼</button>
            </div>
            <button class="remove-action" style="background: var(--accent-red); border: none; border-radius: 4px; padding: 4px 8px; color: white; cursor: pointer; font-size: 12px;">🗑️ Remove</button>
        </div>
        
        <div style="display: grid; grid-template-columns: 100px 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">⏱️ Delay (ms)</label>
                <input type="number" class="delay-input" value="${action.delay || 0}" min="0" step="100" style="width: 100%; padding: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 13px;">
            </div>
            
            <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">🎬 Function</label>
                <select class="function-input" style="width: 100%; padding: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 13px;">
                    ${Object.entries(VMIX_CATEGORIES).map(([category, functions]) => {
                        const options = functions.map(fn => {
                            const info = VMIX_FUNCTIONS_DB[fn] || {};
                            const label = info.description ? `${fn} - ${info.description}` : fn;
                            return `<option value="${fn}" ${action.function === fn ? 'selected' : ''}>${label}</option>`;
                        }).join('');
                        return `<optgroup label="───── ${category.toUpperCase()} ─────">${options}</optgroup>`;
                    }).join('')}
                </select>
            </div>
        </div>
        
        ${functionInfo.description ? `<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px; padding: 8px; background: var(--bg-secondary); border-radius: 4px;">ℹ️ ${functionInfo.description}</div>` : ''}
        
        <div class="dynamic-params" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            ${hasInput ? `
            <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">📺 Input</label>
                <input type="text" class="input-input" value="${action.input || ''}" placeholder="e.g., 1 or Camera 1" style="width: 100%; padding: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 13px;">
            </div>
            ` : ''}
            
            ${hasValue ? `
            <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">📝 Value</label>
                <input type="text" class="value-input" value="${action.value || ''}" placeholder="${getValuePlaceholder(action.function)}" style="width: 100%; padding: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 13px;">
            </div>
            ` : ''}
            
            ${hasMix ? `
            <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">🎚️ Mix</label>
                <input type="text" class="mix-input" value="${action.mix || ''}" placeholder="Leave empty for default" style="width: 100%; padding: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 13px;">
            </div>
            ` : ''}
            
            ${hasChannel ? `
            <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">📡 Channel</label>
                <input type="text" class="channel-input" value="${action.channel || ''}" placeholder="e.g., A or B" style="width: 100%; padding: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 13px;">
            </div>
            ` : ''}
            
            ${hasDuration ? `
            <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">⏲️ Duration (ms)</label>
                <input type="number" class="duration-input" value="${action.duration || ''}" min="0" step="100" placeholder="1000" style="width: 100%; padding: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 13px;">
            </div>
            ` : ''}
        </div>
    `;
    
    container.appendChild(actionEl);
    
    // Event listeners for this action item
    actionEl.querySelector('.remove-action').addEventListener('click', () => {
        const config = state.selectedNode.config;
        config.actionSequence.splice(index, 1);
        refreshActionSequenceUI();
    });
    
    actionEl.querySelector('.move-up').addEventListener('click', () => {
        if (index > 0) {
            const config = state.selectedNode.config;
            [config.actionSequence[index - 1], config.actionSequence[index]] = 
            [config.actionSequence[index], config.actionSequence[index - 1]];
            refreshActionSequenceUI();
        }
    });
    
    actionEl.querySelector('.move-down').addEventListener('click', () => {
        const config = state.selectedNode.config;
        if (index < config.actionSequence.length - 1) {
            [config.actionSequence[index], config.actionSequence[index + 1]] = 
            [config.actionSequence[index + 1], config.actionSequence[index]];
            refreshActionSequenceUI();
        }
    });
    
    // Function change handler to rebuild parameters
    actionEl.querySelector('.function-input').addEventListener('change', (e) => {
        action.function = e.target.value;
        refreshActionSequenceUI();
    });
}

function getValuePlaceholder(functionName) {
    const placeholders = {
        'SetVolume': '0-100',
        'SetVolumeFade': '50,1000 (volume,ms)',
        'SetText': 'Text content',
        'SetBalance': '-1 to 1',
        'SetZoom': '0-5',
        'SetPanX': '-2 to 2',
        'SetPanY': '-2 to 2',
        'SetAlpha': '0-255',
        'SetPosition': 'milliseconds',
        'SetFader': '0-255',
        'SetCountdown': '00:10:00'
    };
    return placeholders[functionName] || 'Value';
}

function refreshActionSequenceUI() {
    const config = state.selectedNode.config;
    const container = document.getElementById('actionSequenceList');
    container.innerHTML = config.actionSequence.length === 0 ? 
        '<div style="padding: 20px; text-align: center; color: var(--text-secondary); background: var(--bg-tertiary); border-radius: 4px;">No actions yet. Click "Add Action" to start building your sequence.</div>' : '';
    
    config.actionSequence.forEach((action, index) => renderActionItem(action, index));
}

function closeModal() {
    document.getElementById('configModal').classList.remove('active');
    state.selectedNode = null;
}

function saveNodeConfig() {
    if (!state.selectedNode) return;
    
    if (state.selectedNode.type === 'action') {
        // Collect all actions from the UI
        const actionSequence = [];
        const actionItems = document.querySelectorAll('.action-item');
        
        actionItems.forEach(item => {
            const delayInput = item.querySelector('.delay-input');
            const functionInput = item.querySelector('.function-input');
            const inputInput = item.querySelector('.input-input');
            const valueInput = item.querySelector('.value-input');
            const durationInput = item.querySelector('.duration-input');
            const mixInput = item.querySelector('.mix-input');
            const channelInput = item.querySelector('.channel-input');
            
            actionSequence.push({
                delay: delayInput ? delayInput.value : 0,
                function: functionInput ? functionInput.value : '',
                input: inputInput ? inputInput.value : '',
                value: valueInput ? valueInput.value : '',
                duration: durationInput ? durationInput.value : '',
                mix: mixInput ? mixInput.value : '',
                channel: channelInput ? channelInput.value : '',
                transition: '',
                selectedIndex: ''
            });
        });

        state.selectedNode.config = { actionSequence };

        // Update node label
        const actionCount = actionSequence.length;
        const totalDelay = actionSequence.reduce((sum, a) => sum + (parseInt(a.delay) || 0), 0);
        const delayLabel = totalDelay > 0 ? ` [${totalDelay}ms]` : '';
        state.selectedNode.label = `🎬 ${actionCount} Action${actionCount !== 1 ? 's' : ''}${delayLabel}`;
    } else if (state.selectedNode.type === 'vmix-trigger') {
        // Save vMix trigger config
        const targetInput = document.getElementById('targetInput').value.trim();
        state.selectedNode.config = { targetInput };
        
        // Update label with target if specified
        const targetLabel = targetInput ? ` [${targetInput}]` : '';
        state.selectedNode.label = `${VMIX_TRIGGER_LABELS[state.selectedNode.triggerType]?.label || state.selectedNode.triggerType}${targetLabel}`;
    }

    saveWorkflow();
    renderAllNodes();
    renderConnections();
    closeModal();
}

function deleteCurrentNode() {
    if (!state.selectedNode) return;

    if (confirm(`Delete node "${state.selectedNode.label}"?`)) {
        state.nodes = state.nodes.filter(n => n.id !== state.selectedNode.id);
        state.connections = state.connections.filter(c => 
            c.fromNodeId !== state.selectedNode.id && c.toNodeId !== state.selectedNode.id
        );
        
        saveWorkflow();
        renderAllNodes();
        renderConnections();
        updateStatusDisplay();
        closeModal();
    }
}

async function testCurrentNode() {
    if (!state.selectedNode) return;

    try {
        const response = await fetch(`/api/nodes/${state.selectedNode.id}/test`, { method: 'POST' });
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Node tested successfully!\n\n${result.message}`);
        } else {
            alert(`❌ Test failed:\n\n${result.error}`);
        }
    } catch (error) {
        alert(`❌ Test failed:\n\n${error.message}`);
    }
}

// ==================== WORKFLOW PERSISTENCE ====================

async function saveWorkflow() {
    try {
        await fetch('/api/workflow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nodes: state.nodes, 
                connections: state.connections,
                groups: state.groups 
            })
        });
    } catch (error) {
        console.error('Failed to save workflow:', error);
    }
}

async function loadWorkflow() {
    try {
        const response = await fetch('/api/workflow');
        const workflow = await response.json();
        
        state.nodes = workflow.nodes || [];
        state.connections = workflow.connections || [];
        state.groups = workflow.groups || [];
        
        nodeIdCounter = Math.max(...state.nodes.map(n => parseInt(n.id.split('_')[1]) || 0), 0) + 1;
        connectionIdCounter = Math.max(...state.connections.map(c => parseInt(c.id.split('_')[1]) || 0), 0) + 1;
        groupIdCounter = Math.max(...state.groups.map(g => parseInt(g.id.split('_')[1]) || 0), 0) + 1;
        
        renderAllNodes();
        renderConnections();
        updateStatusDisplay();
    } catch (error) {
        console.error('Failed to load workflow:', error);
    }
}

function clearWorkflow() {
    if (confirm('Clear all nodes, connections, and groups? This cannot be undone.')) {
        state.nodes = [];
        state.connections = [];
        state.groups = [];
        saveWorkflow();
        renderAllNodes();
        renderConnections();
        updateStatusDisplay();
    }
}

// ==================== PRESET MANAGEMENT ====================

async function savePreset() {
    const name = document.getElementById('presetName').value.trim();
    
    if (!name) {
        alert('Please enter a preset name');
        return;
    }

    try {
        const response = await fetch('/api/presets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                workflow: { nodes: state.nodes, connections: state.connections }
            })
        });

        const result = await response.json();
        
        if (result.success) {
            document.getElementById('presetName').value = '';
            loadPresets();
            alert(`✅ Preset "${name}" saved successfully!`);
        }
    } catch (error) {
        alert(`❌ Failed to save preset:\n\n${error.message}`);
    }
}

async function loadPresets() {
    try {
        const response = await fetch('/api/presets');
        const presets = await response.json();
        
        const presetList = document.getElementById('presetList');
        presetList.innerHTML = presets.map(preset => `
            <div class="preset-item">
                <span class="preset-item-name">${preset.name}</span>
                <div class="preset-item-actions">
                    <button onclick="loadPreset('${preset.filename}')">Load</button>
                    <button onclick="deletePreset('${preset.filename}')">×</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load presets:', error);
    }
}

async function loadPreset(filename) {
    try {
        const response = await fetch(`/api/presets/${filename}`);
        const workflow = await response.json();
        
        state.nodes = workflow.nodes || [];
        state.connections = workflow.connections || [];
        
        nodeIdCounter = Math.max(...state.nodes.map(n => parseInt(n.id.split('_')[1]) || 0), 0) + 1;
        connectionIdCounter = Math.max(...state.connections.map(c => parseInt(c.id.split('_')[1]) || 0), 0) + 1;
        
        saveWorkflow();
        renderAllNodes();
        renderConnections();
        updateStatusDisplay();
    } catch (error) {
        alert(`❌ Failed to load preset:\n\n${error.message}`);
    }
}

async function deletePreset(filename) {
    if (!confirm('Delete this preset?')) return;

    try {
        await fetch(`/api/presets/${filename}`, { method: 'DELETE' });
        loadPresets();
    } catch (error) {
        alert(`❌ Failed to delete preset:\n\n${error.message}`);
    }
}

// ==================== STATUS UPDATES ====================

function updateStatusDisplay() {
    document.getElementById('nodeCount').textContent = state.nodes.length;
    document.getElementById('connectionCount').textContent = state.connections.length;
    document.getElementById('groupCount').textContent = state.groups.length;
}

// Check vMix connectivity
setInterval(async () => {
    try {
        const response = await fetch('http://localhost:8088/api');
        document.getElementById('vmixStatus').textContent = '✅ Connected';
    } catch {
        document.getElementById('vmixStatus').textContent = '❌ Offline';
    }
}, 5000);
