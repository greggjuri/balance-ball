// ==================== UI ====================
// UI updates and settings management

import { state, saveSettings, updateBestTime } from './state.js';
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
    
    document.querySelectorAll('.setting-option').forEach(opt => {
        const setting = opt.dataset.setting;
        const value = opt.dataset.value;
        opt.classList.toggle('selected', settings[setting] === value);
    });
    
    document.getElementById('soundToggle').classList.toggle('on', settings.soundEnabled);
    document.getElementById('shieldToggle').classList.toggle('on', settings.powerUpShield);
    document.getElementById('widePlatformToggle').classList.toggle('on', settings.powerUpWidePlatform);
    document.getElementById('magnetToggle').classList.toggle('on', settings.powerUpMagnet);
    document.getElementById('shrinkBallToggle').classList.toggle('on', settings.powerUpShrinkBall);
    document.getElementById('timeFreezeToggle').classList.toggle('on', settings.powerUpTimeFreeze);
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
        case 'timeFreeze':
            settings.powerUpTimeFreeze = !settings.powerUpTimeFreeze;
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
    const { gameRunning, beingSucked, startTime, finalTime, bestTime, effects } = state;
    
    // Time display
    if (gameRunning && !beingSucked) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        document.getElementById('timeDisplay').textContent = elapsed;
    } else if (finalTime) {
        document.getElementById('timeDisplay').textContent = finalTime;
    }
    
    document.getElementById('bestDisplay').textContent = bestTime.toFixed(1);
    
    // Angle display
    const angleDegrees = (getPlatformAngle() * 180 / Math.PI).toFixed(1);
    document.getElementById('angleDisplay').textContent = angleDegrees + '°';

    // Power-up timers
    updateEffectDisplay('shield', 'shieldDisplay', effects.shield);
    updateEffectDisplay('widePlatform', 'widePlatformDisplay', effects.widePlatform);
    updateEffectDisplay('magnet', 'magnetDisplay', effects.magnet);
    updateEffectDisplay('shrinkBall', 'shrinkBallDisplay', effects.shrinkBall);
    updateEffectDisplay('timeFreeze', 'timeFreezeDisplay', effects.timeFreeze);
}

function updateEffectDisplay(name, elementId, effect) {
    const display = document.getElementById(elementId);
    if (effect.active) {
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
    
    updateBestTime();

    document.getElementById('finalTime').textContent = state.finalTime;
    document.getElementById('gameOverReason').textContent = state.gameOverReason;
    document.getElementById('gameOver').style.display = 'block';
}

export function hideGameOver() {
    document.getElementById('gameOver').style.display = 'none';
}

// ==================== INITIALIZATION ====================

export function initUI() {
    document.getElementById('bestDisplay').textContent = state.bestTime.toFixed(1);
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
