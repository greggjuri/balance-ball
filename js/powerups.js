// ==================== POWER-UPS ====================
// Power-up spawning, collection, and effect management

import { CANVAS, POWERUP, BALL, PHYSICS } from './config.js';
import { state } from './state.js';
import { applyPlatformWidth } from './entities.js';

// ==================== UTILITY ====================

// Generate random speed variation (±10% of base speed)
function getRandomSpeedVariation() {
    return 0.9 + Math.random() * 0.2;  // Returns 0.9 to 1.1
}

// ==================== SPAWNING ====================

export function spawnPowerUp() {
    const { settings } = state;
    const enabledTypes = [];
    
    // Power-ups (good)
    if (settings.powerUpShield) enabledTypes.push('shield');
    if (settings.powerUpWidePlatform) enabledTypes.push('widePlatform');
    if (settings.powerUpMagnet) enabledTypes.push('magnet');
    if (settings.powerUpShrinkBall) enabledTypes.push('shrinkBall');
    if (settings.powerUpBigBallz) enabledTypes.push('bigBallz');
    if (settings.powerUpTimeFreeze) enabledTypes.push('timeFreeze');
    
    // Power-downs (bad)
    if (settings.powerDownNarrowPlatform) enabledTypes.push('narrowPlatform');
    if (settings.powerDownIceMode) enabledTypes.push('iceMode');
    if (settings.powerDownBlinkingEye) enabledTypes.push('blinkingEye');
    if (settings.powerDownEarthquake) enabledTypes.push('earthquake');
    
    if (enabledTypes.length === 0) return;
    
    const type = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];
    const x = POWERUP.RADIUS + Math.random() * (CANVAS.WIDTH - POWERUP.RADIUS * 2);
    
    state.powerUps.push({
        type: type,
        x: x,
        y: -POWERUP.RADIUS,
        radius: POWERUP.RADIUS,
        rotation: 0,
        speedVariation: getRandomSpeedVariation()  // ±10% random speed
    });
}

// ==================== UPDATE ====================

export function updatePowerUps() {
    const { powerUps, effects } = state;
    
    // Spawn timer
    state.powerUpSpawnTimer++;
    if (state.powerUpSpawnTimer >= POWERUP.SPAWN_INTERVAL) {
        spawnPowerUp();
        state.powerUpSpawnTimer = 0;
    }

    // Move power-ups (NOT affected by time freeze - only black holes freeze)
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const pu = powerUps[i];
        // Apply base speed and random variation
        pu.y += PHYSICS.SCROLL_SPEED * pu.speedVariation;
        pu.rotation += 0.03;

        if (pu.y > CANVAS.HEIGHT + pu.radius) {
            powerUps.splice(i, 1);
        }
    }

    // Check effect expirations
    const now = Date.now();
    
    if (effects.shield.active && now > effects.shield.endTime) {
        effects.shield.active = false;
    }

    if (effects.widePlatform.active && now > effects.widePlatform.endTime) {
        effects.widePlatform.active = false;
        applyPlatformWidth();
    }

    if (effects.magnet.active && now > effects.magnet.endTime) {
        effects.magnet.active = false;
    }

    if (effects.timeFreeze.active && now > effects.timeFreeze.endTime) {
        effects.timeFreeze.active = false;
    }

    if (effects.narrowPlatform.active && now > effects.narrowPlatform.endTime) {
        effects.narrowPlatform.active = false;
        applyPlatformWidth();
    }

    if (effects.iceMode.active && now > effects.iceMode.endTime) {
        effects.iceMode.active = false;
    }

    if (effects.blinkingEye.active && now > effects.blinkingEye.endTime) {
        effects.blinkingEye.active = false;
    }

    if (effects.earthquake.active && now > effects.earthquake.endTime) {
        effects.earthquake.active = false;
    }
}

// ==================== COLLISION ====================

export function checkPowerUpCollision() {
    const { ball, powerUps } = state;
    
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const pu = powerUps[i];
        const dx = ball.x - pu.x;
        const dy = ball.y - pu.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball.radius + pu.radius) {
            activatePowerUp(pu.type);
            powerUps.splice(i, 1);
        }
    }
}

// ==================== ACTIVATION ====================

export function activatePowerUp(type) {
    const { effects, ball } = state;
    const now = Date.now();
    
    switch (type) {
        case 'shield':
            effects.shield.active = true;
            effects.shield.endTime = now + POWERUP.DURATION;
            break;
            
        case 'widePlatform':
            effects.widePlatform.active = true;
            effects.widePlatform.endTime = now + POWERUP.DURATION;
            applyPlatformWidth();
            break;
            
        case 'magnet':
            effects.magnet.active = true;
            effects.magnet.endTime = now + POWERUP.DURATION;
            break;
            
        case 'shrinkBall':
            // Shrink Ball: shrinks ball to 50% (permanent)
            // If already shrunk -> no effect
            // If normal -> shrink to 50%
            // If big -> return to normal
            if (state.ballSizeState === 'big') {
                state.ballSizeState = 'normal';
                ball.radius = BALL.BASE_RADIUS * BALL.SIZE_NORMAL;
            } else if (state.ballSizeState === 'normal') {
                state.ballSizeState = 'shrunk';
                ball.radius = BALL.BASE_RADIUS * BALL.SIZE_SHRUNK;
            }
            // If already shrunk, no effect
            break;
            
        case 'bigBallz':
            // Big Ballz: grows ball to 140% (permanent)
            // If already big -> no effect
            // If normal -> grow to 140%
            // If shrunk -> return to normal
            if (state.ballSizeState === 'shrunk') {
                state.ballSizeState = 'normal';
                ball.radius = BALL.BASE_RADIUS * BALL.SIZE_NORMAL;
            } else if (state.ballSizeState === 'normal') {
                state.ballSizeState = 'big';
                ball.radius = BALL.BASE_RADIUS * BALL.SIZE_BIG;
            }
            // If already big, no effect
            break;
            
        case 'timeFreeze':
            effects.timeFreeze.active = true;
            effects.timeFreeze.endTime = now + POWERUP.DURATION;
            break;
            
        case 'narrowPlatform':
            // Narrow Platform: shrinks platform 30% for 12 seconds
            effects.narrowPlatform.active = true;
            effects.narrowPlatform.endTime = now + POWERUP.DURATION;
            applyPlatformWidth();
            break;
            
        case 'iceMode':
            // Ice Mode: super slippery platform for 12 seconds
            effects.iceMode.active = true;
            effects.iceMode.endTime = now + POWERUP.DURATION;
            break;
            
        case 'blinkingEye':
            // Blinking Eye: ball is invisible every other second for 12 seconds
            effects.blinkingEye.active = true;
            effects.blinkingEye.endTime = now + POWERUP.DURATION;
            break;
            
        case 'earthquake':
            // Earthquake: platform shakes randomly for 12 seconds
            effects.earthquake.active = true;
            effects.earthquake.endTime = now + POWERUP.DURATION;
            break;
    }
}

// ==================== EFFECT GETTERS ====================

export function isShieldActive() {
    return state.effects.shield.active;
}

export function isMagnetActive() {
    return state.effects.magnet.active;
}

export function isTimeFreezeActive() {
    return state.effects.timeFreeze.active;
}

// Check if ball should be visible (for blinking eye effect)
export function isBallVisible() {
    if (!state.effects.blinkingEye.active) return true;
    // Blink every second: visible for 1 sec, invisible for 1 sec
    const elapsed = Date.now() - (state.effects.blinkingEye.endTime - POWERUP.DURATION);
    const secondsPassed = Math.floor(elapsed / 1000);
    return secondsPassed % 2 === 0;  // Visible on even seconds, invisible on odd
}

export function getEffectTimeRemaining(effectName) {
    const effect = state.effects[effectName];
    if (!effect || !effect.active) return 0;
    return Math.max(0, (effect.endTime - Date.now()) / 1000);
}
