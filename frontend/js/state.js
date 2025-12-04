// ==================== GAME STATE ====================
// Centralized state management

import { DEFAULT_SETTINGS, PLATFORM, BALL } from './config.js';

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('balanceSettings');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Merge: defaults first, then saved settings
        // This ensures new settings get their default values
        const merged = { ...DEFAULT_SETTINGS };
        for (const key in parsed) {
            if (parsed[key] !== undefined) {
                merged[key] = parsed[key];
            }
        }
        return merged;
    }
    return { ...DEFAULT_SETTINGS };
}

// Save settings to localStorage
export function saveSettings() {
    localStorage.setItem('balanceSettings', JSON.stringify(state.settings));
}

// Game state object
export const state = {
    // Game status
    gameRunning: true,
    gamePaused: false,
    startTime: Date.now(),
    score: 0,
    bestScore: parseFloat(localStorage.getItem('balanceBestScore') || '0'),
    gameOverReason: '',
    finalScore: 0,

    // Settings
    settings: loadSettings(),

    // Platform state
    platform: {
        x: PLATFORM.INITIAL_X,
        y: PLATFORM.Y,
        width: PLATFORM.BASE_WIDTH,
        height: PLATFORM.HEIGHT,
        tilt: 0,
        maxTilt: PLATFORM.MAX_TILT,
        tiltSpeed: PLATFORM.TILT_SPEED,
        moveSpeed: PLATFORM.MOVE_SPEED,
        minX: PLATFORM.MIN_X,
        maxX: 400
    },
    basePlatformWidth: PLATFORM.BASE_WIDTH,

    // Ball state
    ball: {
        x: 400,
        y: BALL.INITIAL_Y,
        radius: BALL.BASE_RADIUS,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        suckRotation: 0
    },
    trail: [],

    // Extra ball (second ball, null when not active)
    extraBall: null,
    extraBallTrail: [],

    // Black holes
    blackHoles: [],
    spawnTimer: 0,

    // Score balls
    scoreBalls: [],
    scoreBallSpawnTimer: 0,

    // Sucking animation
    beingSucked: false,
    suckingHole: null,
    suckProgress: 0,
    suckStartPos: { x: 0, y: 0 },
    suckStartRadius: 0,
    suckParticles: [],

    // Power-ups
    powerUps: [],
    powerUpSpawnTimer: 0,

    // Active effects (timed)
    effects: {
        shield: { active: false, endTime: 0 },
        widePlatform: { active: false, endTime: 0 },
        magnet: { active: false, endTime: 0 },
        timeFreeze: { active: false, endTime: 0 },
        narrowPlatform: { active: false, endTime: 0 },
        iceMode: { active: false, endTime: 0 },
        blinkingEye: { active: false, endTime: 0 },
        earthquake: { active: false, endTime: 0 }
    },

    // Ball size state: 'shrunk', 'normal', or 'big' (permanent until countered)
    ballSizeState: 'normal',

    // Input state
    keys: {
        a: false,
        z: false,
        n: false,
        m: false,
        p: false
    }
};

// Reset game state
export function resetState() {
    state.gameRunning = true;
    state.gamePaused = false;
    state.startTime = Date.now();
    state.score = 0;
    state.gameOverReason = '';
    state.finalScore = 0;

    // Reset platform
    state.platform.tilt = 0;

    // Reset ball
    state.ball.x = state.platform.x + state.platform.width / 2;
    state.ball.y = BALL.INITIAL_Y;
    state.ball.vx = 0;
    state.ball.vy = 0;
    state.ball.radius = BALL.BASE_RADIUS;
    state.ball.suckRotation = 0;

    // Clear arrays
    state.trail.length = 0;
    state.extraBallTrail.length = 0;
    state.blackHoles.length = 0;
    state.scoreBalls.length = 0;
    state.powerUps.length = 0;
    state.suckParticles.length = 0;

    // Reset extra ball
    state.extraBall = null;

    // Reset timers
    state.spawnTimer = 0;
    state.scoreBallSpawnTimer = 0;
    state.powerUpSpawnTimer = 0;

    // Reset sucking state
    state.beingSucked = false;
    state.suckingHole = null;
    state.suckProgress = 0;

    // Reset all effects
    for (const key in state.effects) {
        state.effects[key].active = false;
        state.effects[key].endTime = 0;
    }

    // Reset ball size state
    state.ballSizeState = 'normal';
}

// Update best score
export function updateBestScore() {
    if (state.finalScore > state.bestScore) {
        state.bestScore = state.finalScore;
        localStorage.setItem('balanceBestScore', state.bestScore.toString());
    }
}
