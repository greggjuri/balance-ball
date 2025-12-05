// ==================== INPUT ====================
// Keyboard input handling

import { state } from './state.js';
import { closeSettings, closeHelp } from './ui.js';
import { startMusicOnFirstInput } from './audio.js';

let restartCallback = null;

export function initInput(onRestart) {
    restartCallback = onRestart;
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    
    // Start music on first game input
    if (state.keys.hasOwnProperty(key)) {
        startMusicOnFirstInput();
    }
    
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
    
    // Handle Enter key - submit score if focused on input fields
    if (e.key === 'Enter' && !state.gameRunning) {
        const activeElement = document.activeElement;
        const isInScoreForm = activeElement && (
            activeElement.id === 'playerName' || 
            activeElement.id === 'playerMessage'
        );
        
        if (isInScoreForm) {
            // Submit score instead of restarting
            e.preventDefault();
            const submitBtn = document.getElementById('submitScoreBtn');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.click();
            }
            return;
        }
    }
    
    // Restart game on Space when game over
    if (e.code === 'Space' && !state.gameRunning && restartCallback) {
        // Don't restart if typing in an input field
        const activeElement = document.activeElement;
        const isTyping = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA'
        );
        
        if (!isTyping) {
            e.preventDefault();
            restartCallback();
        }
    }
    
    // Toggle pause on P key
    if (key === 'p' && state.gameRunning && !state.beingSucked) {
        state.gamePaused = !state.gamePaused;
    }
    
    // Close settings/help on Escape
    if (e.key === 'Escape') {
        closeSettings();
        closeHelp();
    }
}
