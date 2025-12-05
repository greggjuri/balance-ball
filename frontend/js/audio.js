// ==================== AUDIO ====================
// Audio management for game music and sound effects

import { state, saveSettings } from './state.js';

// Audio elements
let bgMusic = null;
let musicStarted = false;
let fadeInterval = null;

// Constants
const FADE_DURATION = 1000; // 1 second fade
const FADE_STEPS = 20;
const MAX_VOLUME = 0.5; // Max volume for background music

// ==================== INITIALIZATION ====================

export function initAudio() {
    // Create audio element for background music
    bgMusic = new Audio('assets/sounds/game-music.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0;
    
    // Preload the audio
    bgMusic.preload = 'auto';
    
    console.log('Audio: Initialized');
}

// ==================== MUSIC CONTROL ====================

// Start music on first user interaction
export function startMusicOnFirstInput() {
    if (musicStarted || !state.settings.musicEnabled) return;
    
    musicStarted = true;
    playMusic();
}

export function playMusic() {
    if (!bgMusic || !state.settings.musicEnabled) return;
    
    // Clear any existing fade
    if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
    }
    
    bgMusic.play().then(() => {
        fadeIn();
        console.log('Audio: Music started');
    }).catch(err => {
        console.log('Audio: Playback prevented -', err.message);
        // Reset so we can try again on next interaction
        musicStarted = false;
    });
}

export function stopMusic() {
    if (!bgMusic) return;
    
    fadeOut(() => {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        console.log('Audio: Music stopped');
    });
}

export function pauseMusic() {
    if (!bgMusic) return;
    
    fadeOut(() => {
        bgMusic.pause();
        console.log('Audio: Music paused');
    });
}

export function resumeMusic() {
    if (!bgMusic || !state.settings.musicEnabled) return;
    
    bgMusic.play().then(() => {
        fadeIn();
        console.log('Audio: Music resumed');
    }).catch(err => {
        console.log('Audio: Resume prevented -', err.message);
    });
}

// ==================== FADE EFFECTS ====================

function fadeIn(callback) {
    if (!bgMusic) return;
    
    // Clear any existing fade
    if (fadeInterval) {
        clearInterval(fadeInterval);
    }
    
    const stepTime = FADE_DURATION / FADE_STEPS;
    const volumeStep = MAX_VOLUME / FADE_STEPS;
    let currentStep = 0;
    
    bgMusic.volume = 0;
    
    fadeInterval = setInterval(() => {
        currentStep++;
        bgMusic.volume = Math.min(MAX_VOLUME, volumeStep * currentStep);
        
        if (currentStep >= FADE_STEPS) {
            clearInterval(fadeInterval);
            fadeInterval = null;
            bgMusic.volume = MAX_VOLUME;
            if (callback) callback();
        }
    }, stepTime);
}

function fadeOut(callback) {
    if (!bgMusic) return;
    
    // Clear any existing fade
    if (fadeInterval) {
        clearInterval(fadeInterval);
    }
    
    const stepTime = FADE_DURATION / FADE_STEPS;
    const startVolume = bgMusic.volume;
    const volumeStep = startVolume / FADE_STEPS;
    let currentStep = 0;
    
    fadeInterval = setInterval(() => {
        currentStep++;
        bgMusic.volume = Math.max(0, startVolume - volumeStep * currentStep);
        
        if (currentStep >= FADE_STEPS) {
            clearInterval(fadeInterval);
            fadeInterval = null;
            bgMusic.volume = 0;
            if (callback) callback();
        }
    }, stepTime);
}

// ==================== SETTINGS TOGGLE ====================

export function toggleMusic() {
    state.settings.musicEnabled = !state.settings.musicEnabled;
    saveSettings();
    
    // Guard against bgMusic not being initialized
    if (!bgMusic) {
        console.log('Audio: bgMusic not initialized yet');
        return;
    }
    
    if (state.settings.musicEnabled) {
        // If game has had input, start playing
        if (musicStarted) {
            bgMusic.play().then(() => {
                fadeIn();
            }).catch(err => {
                console.log('Audio: Toggle play prevented -', err.message);
            });
        }
    } else {
        // Fade out and pause
        fadeOut(() => {
            if (bgMusic) bgMusic.pause();
        });
    }
}

// ==================== GAME STATE HANDLERS ====================

export function onGameOver() {
    if (!bgMusic || !state.settings.musicEnabled) return;
    
    // Fade out music on game over
    fadeOut(() => {
        bgMusic.pause();
    });
}

export function onGameRestart() {
    if (!bgMusic || !state.settings.musicEnabled) return;
    
    // Reset and play music
    bgMusic.currentTime = 0;
    bgMusic.play().then(() => {
        fadeIn();
    }).catch(err => {
        console.log('Audio: Restart play prevented -', err.message);
    });
}

// ==================== GETTERS ====================

export function isMusicPlaying() {
    return bgMusic && !bgMusic.paused;
}

export function isMusicEnabled() {
    return state.settings.musicEnabled;
}
