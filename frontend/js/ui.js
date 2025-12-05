// ==================== UI ====================
// UI updates and settings management

import { state, saveSettings, updateBestScore } from './state.js';
import { PLATFORM } from './config.js';
import { applyPlatformWidth } from './entities.js';
import { fetchLeaderboard, submitScore, checkScore, formatDate } from './leaderboard.js';
import { toggleMusic as audioToggleMusic } from './audio.js';

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
        const musicToggle = document.getElementById('musicToggle');
        const shieldToggle = document.getElementById('shieldToggle');
        const widePlatformToggle = document.getElementById('widePlatformToggle');
        const magnetToggle = document.getElementById('magnetToggle');
        const shrinkBallToggle = document.getElementById('shrinkBallToggle');
        const bigBallzToggle = document.getElementById('bigBallzToggle');
        const timeFreezeToggle = document.getElementById('timeFreezeToggle');
        const extraBallToggle = document.getElementById('extraBallToggle');
        const randomToggle = document.getElementById('randomToggle');
        const narrowPlatformToggle = document.getElementById('narrowPlatformToggle');
        const iceModeToggle = document.getElementById('iceModeToggle');
        const blinkingEyeToggle = document.getElementById('blinkingEyeToggle');
        const earthquakeToggle = document.getElementById('earthquakeToggle');
        
        if (musicToggle) musicToggle.classList.toggle('on', settings.musicEnabled);
        if (shieldToggle) shieldToggle.classList.toggle('on', settings.powerUpShield);
        if (widePlatformToggle) widePlatformToggle.classList.toggle('on', settings.powerUpWidePlatform);
        if (magnetToggle) magnetToggle.classList.toggle('on', settings.powerUpMagnet);
        if (shrinkBallToggle) shrinkBallToggle.classList.toggle('on', settings.powerUpShrinkBall);
        if (bigBallzToggle) bigBallzToggle.classList.toggle('on', settings.powerUpBigBallz);
        if (timeFreezeToggle) timeFreezeToggle.classList.toggle('on', settings.powerUpTimeFreeze);
        if (extraBallToggle) extraBallToggle.classList.toggle('on', settings.powerUpExtraBall);
        if (randomToggle) randomToggle.classList.toggle('on', settings.powerUpRandom);
        if (narrowPlatformToggle) narrowPlatformToggle.classList.toggle('on', settings.powerDownNarrowPlatform);
        if (iceModeToggle) iceModeToggle.classList.toggle('on', settings.powerDownIceMode);
        if (blinkingEyeToggle) blinkingEyeToggle.classList.toggle('on', settings.powerDownBlinkingEye);
        if (earthquakeToggle) earthquakeToggle.classList.toggle('on', settings.powerDownEarthquake);
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

export function toggleMusic() {
    audioToggleMusic();
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
        case 'extraBall':
            settings.powerUpExtraBall = !settings.powerUpExtraBall;
            break;
        case 'random':
            settings.powerUpRandom = !settings.powerUpRandom;
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
        case 'earthquake':
            settings.powerDownEarthquake = !settings.powerDownEarthquake;
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
    const { effects } = state;

    // Power-up timers (these remain in the HTML stats bar)
    updateEffectDisplay('shield', 'shieldDisplay', effects.shield);
    updateEffectDisplay('widePlatform', 'widePlatformDisplay', effects.widePlatform);
    updateEffectDisplay('magnet', 'magnetDisplay', effects.magnet);
    updateEffectDisplay('timeFreeze', 'timeFreezeDisplay', effects.timeFreeze);
    updateEffectDisplay('narrowPlatform', 'narrowPlatformDisplay', effects.narrowPlatform);
    updateEffectDisplay('iceMode', 'iceModeDisplay', effects.iceMode);
    updateEffectDisplay('blinkingEye', 'blinkingEyeDisplay', effects.blinkingEye);
    updateEffectDisplay('earthquake', 'earthquakeDisplay', effects.earthquake);
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

// ==================== LEADERBOARD ====================

let cachedLeaderboard = null;

function getRankDisplay(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function generateLeaderboardHTML(data) {
    if (!data || data.length === 0) {
        return '<tr><td colspan="5" class="no-scores">No scores yet. Be the first!</td></tr>';
    }
    
    return data.map(entry => `
        <tr class="${entry.rank <= 3 ? 'top-' + entry.rank : ''}">
            <td class="rank">${getRankDisplay(entry.rank)}</td>
            <td class="name">${escapeHtml(entry.name)}</td>
            <td class="score">${entry.score}</td>
            <td class="date">${formatDate(entry.created_at)}</td>
            <td class="message">${escapeHtml(entry.message || '')}</td>
        </tr>
    `).join('');
}

export async function loadLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    const miniLeaderboardBody = document.getElementById('miniLeaderboardBody');
    
    const loadingHTML = '<tr><td colspan="5" class="loading"><span class="loading-spinner"></span>Loading...</td></tr>';
    const wakingUpHTML = '<tr><td colspan="5" class="loading waking-up"><span class="loading-spinner"></span>Server waking up, please wait...</td></tr>';
    
    // Set loading state for both
    if (leaderboardBody) {
        leaderboardBody.innerHTML = loadingHTML;
    }
    if (miniLeaderboardBody) {
        miniLeaderboardBody.innerHTML = loadingHTML;
    }
    
    // Show "waking up" message if loading takes more than 3 seconds
    const wakingUpTimeout = setTimeout(() => {
        if (leaderboardBody) {
            leaderboardBody.innerHTML = wakingUpHTML;
        }
        if (miniLeaderboardBody) {
            miniLeaderboardBody.innerHTML = wakingUpHTML;
        }
    }, 3000);
    
    const data = await fetchLeaderboard();
    clearTimeout(wakingUpTimeout);
    cachedLeaderboard = data;
    
    // Full leaderboard (top 20)
    const fullHtml = generateLeaderboardHTML(data);
    
    // Mini leaderboard (top 3 only)
    const top3Data = data ? data.slice(0, 3) : null;
    const miniHtml = generateLeaderboardHTML(top3Data);
    
    // Update both tables
    if (leaderboardBody) {
        leaderboardBody.innerHTML = fullHtml;
    }
    if (miniLeaderboardBody) {
        miniLeaderboardBody.innerHTML = miniHtml;
    }
}

export function openLeaderboard() {
    document.getElementById('leaderboardOverlay').classList.add('active');
    loadLeaderboard();
}

export function closeLeaderboard() {
    document.getElementById('leaderboardOverlay').classList.remove('active');
}

export function closeLeaderboardOnOverlay(event) {
    if (event.target.id === 'leaderboardOverlay') {
        closeLeaderboard();
    }
}

// ==================== HELP ====================

export function openHelp() {
    document.getElementById('helpOverlay').classList.add('active');
}

export function closeHelp() {
    document.getElementById('helpOverlay').classList.remove('active');
}

export function closeHelpOnOverlay(event) {
    if (event.target.id === 'helpOverlay') {
        closeHelp();
    }
}

// ==================== SCORE SUBMISSION ====================

export async function showScoreSubmission() {
    const submitSection = document.getElementById('submitScoreSection');
    const rankInfo = document.getElementById('submitRankInfo');
    
    // Show checking state
    if (submitSection) {
        submitSection.style.display = 'block';
    }
    if (rankInfo) {
        rankInfo.innerHTML = '<span class="loading-spinner"></span>Checking score...';
    }
    
    const scoreCheck = await checkScore(state.finalScore);
    
    if (scoreCheck.wouldRank) {
        if (rankInfo) {
            rankInfo.textContent = `Your score would rank #${scoreCheck.rank}!`;
        }
        document.getElementById('playerName').focus();
    } else {
        if (submitSection) {
            submitSection.style.display = 'none';
        }
    }
}

export async function handleScoreSubmit() {
    const nameInput = document.getElementById('playerName');
    const messageInput = document.getElementById('playerMessage');
    const submitBtn = document.getElementById('submitScoreBtn');
    
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    
    if (!name) {
        nameInput.classList.add('error');
        nameInput.focus();
        return;
    }
    
    nameInput.classList.remove('error');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    const result = await submitScore(name, state.finalScore, message);
    
    if (result && result.success) {
        // Save name for next time
        localStorage.setItem('balancePlayerName', name);
        
        document.getElementById('submitScoreSection').innerHTML = `
            <p class="submit-success">✓ Score submitted!</p>
        `;
        
        // Refresh leaderboard after short delay to ensure database is updated
        setTimeout(() => {
            loadLeaderboard();
        }, 500);
    } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Score';
        alert('Failed to submit score. Please try again.');
    }
}

// ==================== GAME OVER ====================

export async function showGameOver(reason) {
    state.gameRunning = false;
    state.gameOverReason = reason || 'The ball fell off the platform!';
    
    updateBestScore();

    document.getElementById('finalScore').textContent = state.finalScore;
    document.getElementById('gameOverReason').textContent = state.gameOverReason;
    
    // Reset submission form
    const submitSection = document.getElementById('submitScoreSection');
    if (submitSection) {
        submitSection.style.display = 'none';
        submitSection.innerHTML = `
            <p id="submitRankInfo" class="rank-info"></p>
            <div class="submit-form">
                <input type="text" id="playerName" placeholder="Your name (max 20)" maxlength="20">
                <input type="text" id="playerMessage" placeholder="Message (optional, max 30)" maxlength="30">
                <button id="submitScoreBtn" onclick="handleScoreSubmit()">Submit Score</button>
            </div>
        `;
        
        // Restore saved name
        const savedName = localStorage.getItem('balancePlayerName');
        if (savedName) {
            const nameInput = document.getElementById('playerName');
            if (nameInput) nameInput.value = savedName;
        }
    }
    
    document.getElementById('gameOver').style.display = 'block';
    
    // Check if score qualifies for leaderboard
    await showScoreSubmission();
    
    // Load leaderboard
    await loadLeaderboard();
}

export function hideGameOver() {
    document.getElementById('gameOver').style.display = 'none';
}

// ==================== INITIALIZATION ====================

export function initUI() {
    applySettingsToGame();
    updateSettingsUI();
}

// Export functions to window for HTML onclick handlers
export function setupGlobalHandlers() {
    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    window.closeSettingsOnOverlay = closeSettingsOnOverlay;
    window.selectOption = selectOption;
    window.toggleMusic = toggleMusic;
    window.togglePowerUp = togglePowerUp;
    window.openLeaderboard = openLeaderboard;
    window.closeLeaderboard = closeLeaderboard;
    window.closeLeaderboardOnOverlay = closeLeaderboardOnOverlay;
    window.openHelp = openHelp;
    window.closeHelp = closeHelp;
    window.closeHelpOnOverlay = closeHelpOnOverlay;
    window.handleScoreSubmit = handleScoreSubmit;
}
