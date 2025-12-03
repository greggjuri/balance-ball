// ==================== INPUT ====================
// Keyboard input handling

import { state } from './state.js';
import { closeSettings } from './ui.js';

let restartCallback = null;

export function initInput(onRestart) {
    restartCallback = onRestart;
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    
    if (state.keys.hasOwnProperty(key)) {
        state.keys[key] = true;
        const keyElement = document.getElementById('key' + key.toUpperCase());
        if (keyElement) {
            keyElement.classList.add('active');
        }
    }
}

function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    
    if (state.keys.hasOwnProperty(key)) {
        state.keys[key] = false;
        const keyElement = document.getElementById('key' + key.toUpperCase());
        if (keyElement) {
            keyElement.classList.remove('active');
        }
    }
    
    // Restart game on Enter when game over
    if (e.key === 'Enter' && !state.gameRunning && restartCallback) {
        restartCallback();
    }
    
    // Close settings on Escape
    if (e.key === 'Escape') {
        closeSettings();
    }
}
