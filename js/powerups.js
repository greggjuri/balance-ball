// ==================== POWER-UPS ====================
// Power-up spawning, collection, and effect management

import { CANVAS, POWERUP, BALL, PHYSICS } from './config.js';
import { state } from './state.js';
import { applyPlatformWidth } from './entities.js';

// ==================== SPAWNING ====================

export function spawnPowerUp() {
    const { settings } = state;
    const enabledTypes = [];
    
    if (settings.powerUpShield) enabledTypes.push('shield');
    if (settings.powerUpWidePlatform) enabledTypes.push('widePlatform');
    if (settings.powerUpMagnet) enabledTypes.push('magnet');
    if (settings.powerUpShrinkBall) enabledTypes.push('shrinkBall');
    if (settings.powerUpBigBallz) enabledTypes.push('bigBallz');
    if (settings.powerUpTimeFreeze) enabledTypes.push('timeFreeze');
    
    if (enabledTypes.length === 0) return;
    
    const type = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];
    const x = POWERUP.RADIUS + Math.random() * (CANVAS.WIDTH - POWERUP.RADIUS * 2);
    
    state.powerUps.push({
        type: type,
        x: x,
        y: -POWERUP.RADIUS,
        radius: POWERUP.RADIUS,
        rotation: 0
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

    // Move power-ups (also affected by time freeze)
    const scrollSpeed = effects.timeFreeze.active ? 0 : PHYSICS.SCROLL_SPEED;
    
    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].y += scrollSpeed;
        powerUps[i].rotation += 0.03;

        if (powerUps[i].y > CANVAS.HEIGHT + powerUps[i].radius) {
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

export function getEffectTimeRemaining(effectName) {
    const effect = state.effects[effectName];
    if (!effect || !effect.active) return 0;
    return Math.max(0, (effect.endTime - Date.now()) / 1000);
}
