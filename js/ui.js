// ==================== UI ====================
// UI updates and settings management

import { state, saveSettings, updateBestScore } from './state.js';
import { PLATFORM } from './config.js';
import { getPlatformAngle, applyPlatformWidth } from './entities.js';

// ==================== SETTINGS UI ====================

export function openSettings() {
    document.getElementById('settingsOverlay').classList.add('active');
    updateSettingsUI();
}

export function closeSettings() {
    document.getElementById('settingsOverlay').classList.remove('active');
    saveSettings();
    applySettingsToGame();
}

export function closeSettingsOnOverlay(event) {
    if (event.target.id === 'settingsOverlay') {
        closeSettings();
    }
}

export function updateSettingsUI() {
    const { settings } = state;
    
    try {
        document.querySelectorAll('.setting-option').forEach(opt => {
            const setting = opt.dataset.setting;
            const value = opt.dataset.value;
            opt.classList.toggle('selected', settings[setting] === value);
        });
        
        // Toggle switches - use optional chaining in case elements don't exist
        const soundToggle = document.getElementById('soundToggle');
        const shieldToggle = document.getElementById('shieldToggle');
        const widePlatformToggle = document.getElementById('widePlatformToggle');
        const magnetToggle = document.getElementById('magnetToggle');
        const shrinkBallToggle = document.getElementById('shrinkBallToggle');
        const bigBallzToggle = document.getElementById('bigBallzToggle');
        const timeFreezeToggle = document.getElementById('timeFreezeToggle');
        const narrowPlatformToggle = document.getElementById('narrowPlatformToggle');
        const iceModeToggle = document.getElementById('iceModeToggle');
        const blinkingEyeToggle = document.getElementById('blinkingEyeToggle');
        
        if (soundToggle) soundToggle.classList.toggle('on', settings.soundEnabled);
        if (shieldToggle) shieldToggle.classList.toggle('on', settings.powerUpShield);
        if (widePlatformToggle) widePlatformToggle.classList.toggle('on', settings.powerUpWidePlatform);
        if (magnetToggle) magnetToggle.classList.toggle('on', settings.powerUpMagnet);
        if (shrinkBallToggle) shrinkBallToggle.classList.toggle('on', settings.powerUpShrinkBall);
        if (bigBallzToggle) bigBallzToggle.classList.toggle('on', settings.powerUpBigBallz);
        if (timeFreezeToggle) timeFreezeToggle.classList.toggle('on', settings.powerUpTimeFreeze);
        if (narrowPlatformToggle) narrowPlatformToggle.classList.toggle('on', settings.powerDownNarrowPlatform);
        if (iceModeToggle) iceModeToggle.classList.toggle('on', settings.powerDownIceMode);
        if (blinkingEyeToggle) blinkingEyeToggle.classList.toggle('on', settings.powerDownBlinkingEye);
    } catch (error) {
        console.error('updateSettingsUI error:', error);
    }
}

export function selectOption(element) {
    const setting = element.dataset.setting;
    const value = element.dataset.value;
    state.settings[setting] = value;
    updateSettingsUI();
}

export function toggleSound() {
    state.settings.soundEnabled = !state.settings.soundEnabled;
    updateSettingsUI();
}

export function togglePowerUp(type) {
    const { settings } = state;
    
    switch (type) {
        case 'shield':
            settings.powerUpShield = !settings.powerUpShield;
            break;
        case 'widePlatform':
            settings.powerUpWidePlatform = !settings.powerUpWidePlatform;
            break;
        case 'magnet':
            settings.powerUpMagnet = !settings.powerUpMagnet;
            break;
        case 'shrinkBall':
            settings.powerUpShrinkBall = !settings.powerUpShrinkBall;
            break;
        case 'bigBallz':
            settings.powerUpBigBallz = !settings.powerUpBigBallz;
            break;
        case 'timeFreeze':
            settings.powerUpTimeFreeze = !settings.powerUpTimeFreeze;
            break;
        case 'narrowPlatform':
            settings.powerDownNarrowPlatform = !settings.powerDownNarrowPlatform;
            break;
        case 'iceMode':
            settings.powerDownIceMode = !settings.powerDownIceMode;
            break;
        case 'blinkingEye':
            settings.powerDownBlinkingEye = !settings.powerDownBlinkingEye;
            break;
    }
    updateSettingsUI();
}

export function applySettingsToGame() {
    const { settings } = state;
    
    switch (settings.platformWidth) {
        case 'short':
            state.basePlatformWidth = PLATFORM.BASE_WIDTH * 0.9;
            break;
        case 'wide':
            state.basePlatformWidth = PLATFORM.BASE_WIDTH * 1.1;
            break;
        default:
            state.basePlatformWidth = PLATFORM.BASE_WIDTH;
    }
    applyPlatformWidth();
}

// ==================== GAME UI ====================

export function updateUI() {
    const { gameRunning, beingSucked, score, finalScore, bestScore, effects } = state;
    
    // Score display
    if (gameRunning && !beingSucked) {
        document.getElementById('scoreDisplay').textContent = score;
    } else if (finalScore !== undefined) {
        document.getElementById('scoreDisplay').textContent = finalScore;
    }
    
    document.getElementById('bestDisplay').textContent = bestScore;
    
    // Angle display
    const angleDegrees = (getPlatformAngle() * 180 / Math.PI).toFixed(1);
    document.getElementById('angleDisplay').textContent = angleDegrees + '°';

    // Power-up timers
    updateEffectDisplay('shield', 'shieldDisplay', effects.shield);
    updateEffectDisplay('widePlatform', 'widePlatformDisplay', effects.widePlatform);
    updateEffectDisplay('magnet', 'magnetDisplay', effects.magnet);
    updateEffectDisplay('timeFreeze', 'timeFreezeDisplay', effects.timeFreeze);
    updateEffectDisplay('narrowPlatform', 'narrowPlatformDisplay', effects.narrowPlatform);
    updateEffectDisplay('iceMode', 'iceModeDisplay', effects.iceMode);
    updateEffectDisplay('blinkingEye', 'blinkingEyeDisplay', effects.blinkingEye);
}

function updateEffectDisplay(name, elementId, effect) {
    const display = document.getElementById(elementId);
    if (!display) return;  // Element might not exist
    
    if (effect && effect.active) {
        const remaining = Math.max(0, (effect.endTime - Date.now()) / 1000).toFixed(1);
        display.textContent = remaining + 's';
        display.parentElement.style.display = 'block';
    } else {
        display.parentElement.style.display = 'none';
    }
}

// ==================== GAME OVER ====================

export function showGameOver(reason) {
    state.gameRunning = false;
    state.gameOverReason = reason || 'The ball fell off the platform!';
    
    updateBestScore();

    document.getElementById('finalScore').textContent = state.finalScore;
    document.getElementById('gameOverReason').textContent = state.gameOverReason;
    document.getElementById('gameOver').style.display = 'block';
}

export function hideGameOver() {
    document.getElementById('gameOver').style.display = 'none';
}

// ==================== INITIALIZATION ====================

export function initUI() {
    document.getElementById('bestDisplay').textContent = state.bestScore;
    applySettingsToGame();
    updateSettingsUI();
}

// Export functions to window for HTML onclick handlers
export function setupGlobalHandlers() {
    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    window.closeSettingsOnOverlay = closeSettingsOnOverlay;
    window.selectOption = selectOption;
    window.toggleSound = toggleSound;
    window.togglePowerUp = togglePowerUp;
}
