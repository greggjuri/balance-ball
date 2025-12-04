// ==================== CONFIGURATION ====================
// All game constants and default settings

export const CANVAS = {
    WIDTH: 800,
    HEIGHT: 600
};

export const PHYSICS = {
    GRAVITY: 0.4,
    FRICTION: 0.998,
    BOUNCE_FACTOR: 0.3,
    ROLL_FRICTION: 0.9995,
    MAGNET_ROLL_FRICTION: 0.990,
    SCROLL_SPEED: 1.5
};

export const PLATFORM = {
    INITIAL_X: 225,
    Y: 450,
    BASE_WIDTH: 350,
    HEIGHT: 12,
    MAX_TILT: 80,
    TILT_SPEED: 2.5,
    MOVE_SPEED: 4,
    MIN_X: 50
};

export const BALL = {
    INITIAL_Y: 400,  // Starts above platform, falls down
    BASE_RADIUS: 18,
    TRAIL_LENGTH: 15,
    SIZE_SHRUNK: 0.5,    // 50% of original
    SIZE_NORMAL: 1.0,    // 100% (default)
    SIZE_BIG: 1.4        // 140% of original
};

export const BLACK_HOLE = {
    SPAWN_INTERVAL: 200,
    GRAVITY_RADIUS: 150,
    GRAVITY_STRENGTH: 0.15,
    SPEED_INCREASE_INTERVAL: 20,  // Points needed for each speed increase
    SPEED_INCREASE_AMOUNT: 0.05,  // 5% increase per interval
    MAX_SPEED_MULTIPLIER: 1.5     // Max 150% of default speed
};

export const POWERUP = {
    SPAWN_INTERVAL: 450,
    RADIUS: 15,
    DURATION: 12000  // All timed power-ups/downs last 12 seconds
};

export const SCORE_BALL = {
    SPAWN_INTERVAL: 150,  // Spawn frequently
    TYPES: {
        // 1 point: large (black hole size), slow
        large: { 
            points: 1, 
            sizeMultiplier: 2.0,  // Same as black hole (BASE_RADIUS * 2)
            speedMultiplier: 1.0,
            color: '#ffd700',      // Gold
            glowColor: '#ffaa00'
        },
        // 3 points: medium (default ball size), moderate speed
        medium: { 
            points: 3, 
            sizeMultiplier: 1.0,  // Same as player ball
            speedMultiplier: 1.5,
            color: '#50fa7b',      // Green
            glowColor: '#00ff55'
        },
        // 5 points: small (shrunk ball size), fast
        small: { 
            points: 5, 
            sizeMultiplier: 0.5,  // Same as shrunk ball
            speedMultiplier: 2.0,
            color: '#bd93f9',      // Purple/Diamond
            glowColor: '#ff79c6'
        }
    }
};

export const DEFAULT_SETTINGS = {
    ballColor: 'red',
    platformWidth: 'normal',
    soundEnabled: false,
    powerUpShield: true,
    powerUpWidePlatform: true,
    powerUpMagnet: true,
    powerUpShrinkBall: true,
    powerUpBigBallz: true,
    powerUpTimeFreeze: true,
    powerUpExtraBall: true,
    powerUpRandom: true,
    powerDownNarrowPlatform: true,
    powerDownIceMode: true,
    powerDownBlinkingEye: true,
    powerDownEarthquake: true
};

export const BALL_COLORS = {
    white: {
        gradient: ['#ffffff', '#e0e0e0', '#b0b0b0'],
        glow: '#ffffff',
        suckGradient: ['#aaaaaa', '#777777', '#444444'],
        suckGlow: '#888888'
    },
    red: {
        gradient: ['#ff7b94', '#e94560', '#c73e54'],
        glow: '#e94560',
        suckGradient: ['#cc7bff', '#9932ff', '#6600cc'],
        suckGlow: '#9932ff'
    },
    black: {
        gradient: ['#555555', '#2a2a2a', '#111111'],
        glow: '#666666',
        suckGradient: ['#aaaaaa', '#777777', '#444444'],
        suckGlow: '#888888'
    }
};

// Power-up type definitions
export const POWERUP_TYPES = {
    shield: {
        name: 'Shield',
        icon: '🛡️',
        color: '#4a90d9',
        description: 'Immunity from black holes'
    },
    widePlatform: {
        name: 'Wide Platform',
        icon: '📏',
        color: '#00d9ff',
        description: 'Platform 30% wider'
    },
    magnet: {
        name: 'Magnet',
        icon: '🧲',
        color: '#ff6b35',
        description: 'Ball grips platform'
    },
    shrinkBall: {
        name: 'Shrink Ball',
        icon: '🔮',
        color: '#9932ff',
        description: 'Ball 50% smaller (permanent)'
    },
    bigBallz: {
        name: 'Big Ballz',
        icon: '🏀',
        color: '#ff8c00',
        description: 'Ball 40% bigger (permanent)'
    },
    timeFreeze: {
        name: 'Time Freeze',
        icon: '⏸️',
        color: '#00ffff',
        description: 'Black holes freeze'
    },
    extraBall: {
        name: 'Extra Ball',
        icon: '⚾',
        color: '#ffdd00',
        description: 'Adds a second ball'
    },
    random: {
        name: 'Random',
        icon: '🎲',
        color: '#ff00ff',
        description: 'Random power-up or down'
    },
    // Power-downs (negative effects)
    narrowPlatform: {
        name: 'Narrow Platform',
        icon: '📏',
        color: '#ff3333',
        description: 'Platform 30% narrower',
        isPowerDown: true
    },
    iceMode: {
        name: 'Ice Mode',
        icon: '🧊',
        color: '#88ddff',
        description: 'Platform super slippery',
        isPowerDown: true
    },
    blinkingEye: {
        name: 'Blinking Eye',
        icon: '👁️',
        color: '#ff66ff',
        description: 'Ball blinks invisible',
        isPowerDown: true
    },
    earthquake: {
        name: 'Earthquake',
        icon: '📳',
        color: '#8b4513',
        description: 'Platform shakes violently',
        isPowerDown: true
    }
};
