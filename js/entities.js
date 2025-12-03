// ==================== ENTITIES ====================
// Ball, Platform, and Black Holes logic

import { CANVAS, PHYSICS, BALL, BLACK_HOLE, PLATFORM } from './config.js';
import { state } from './state.js';

// ==================== PLATFORM ====================

export function updatePlatform() {
    const { platform, keys } = state;

    if (keys.a) platform.tilt = Math.max(platform.tilt - platform.tiltSpeed, -platform.maxTilt);
    if (keys.z) platform.tilt = Math.min(platform.tilt + platform.tiltSpeed, platform.maxTilt);
    
    if (keys.n) platform.x = Math.max(platform.x - platform.moveSpeed, platform.minX);
    if (keys.m) platform.x = Math.min(platform.x + platform.moveSpeed, platform.maxX);

    if (!keys.a && !keys.z) {
        platform.tilt *= 0.96;
    }
}

export function getPlatformAngle() {
    return Math.atan2(state.platform.tilt * 2, state.platform.width);
}

export function getPlatformYAtX(x) {
    const { platform } = state;
    const centerX = platform.x + platform.width / 2;
    const relativeX = (x - centerX) / (platform.width / 2);
    return platform.y - (platform.tilt * relativeX);
}

export function applyPlatformWidth() {
    const { platform, effects } = state;
    const oldWidth = platform.width;
    const centerX = platform.x + oldWidth / 2;
    
    // Apply wide platform power-up if active (30% wider)
    if (effects.widePlatform.active) {
        platform.width = state.basePlatformWidth * 1.3;
    } else {
        platform.width = state.basePlatformWidth;
    }
    
    // Recenter platform
    platform.x = centerX - platform.width / 2;
    
    // Clamp to boundaries
    platform.maxX = CANVAS.WIDTH - platform.width - platform.minX;
    platform.x = Math.max(platform.minX, Math.min(platform.x, platform.maxX));
}

// ==================== BALL ====================

export function updateBall() {
    const { ball, platform, effects, trail } = state;
    const angle = getPlatformAngle();
    
    // Reduce gravity effect when magnet is active
    const effectiveGravity = effects.magnet.active ? PHYSICS.GRAVITY * 0.7 : PHYSICS.GRAVITY;
    
    ball.ax = -Math.sin(angle) * effectiveGravity;
    ball.ay = effectiveGravity;

    const platformY = getPlatformYAtX(ball.x);
    const distanceFromPlatform = ball.y + ball.radius - platformY;

    if (ball.x >= platform.x && ball.x <= platform.x + platform.width) {
        if (distanceFromPlatform >= 0 && ball.vy >= 0) {
            ball.y = platformY - ball.radius;
            ball.vx += ball.ax;
            
            // Use higher friction when magnet is active
            const currentRollFriction = effects.magnet.active ? PHYSICS.MAGNET_ROLL_FRICTION : PHYSICS.ROLL_FRICTION;
            ball.vx *= currentRollFriction;
            
            if (ball.vy > 1) {
                // Reduce bounce when magnet is active (90% less)
                const currentBounceFactor = effects.magnet.active ? PHYSICS.BOUNCE_FACTOR * 0.1 : PHYSICS.BOUNCE_FACTOR;
                ball.vy = -ball.vy * currentBounceFactor;
            } else {
                ball.vy = 0;
            }
        } else {
            ball.vy += ball.ay;
        }
    } else {
        ball.vy += ball.ay;
    }

    ball.vx *= PHYSICS.FRICTION;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Update trail
    trail.push({ x: ball.x, y: ball.y });
    if (trail.length > BALL.TRAIL_LENGTH) {
        trail.shift();
    }

    // Check if ball fell off
    if (ball.y > CANVAS.HEIGHT + ball.radius || 
        ball.x < -ball.radius || 
        ball.x > CANVAS.WIDTH + ball.radius) {
        state.finalTime = ((Date.now() - state.startTime) / 1000).toFixed(1);
        return 'fell';
    }
    return null;
}

// ==================== BLACK HOLES ====================

export function spawnBlackHole() {
    const holeRadius = BALL.BASE_RADIUS * 2;
    const x = holeRadius + Math.random() * (CANVAS.WIDTH - holeRadius * 2);
    state.blackHoles.push({
        x: x,
        y: -holeRadius,
        radius: holeRadius,
        rotation: Math.random() * Math.PI * 2
    });
}

export function updateBlackHoles() {
    const { blackHoles, effects } = state;
    
    state.spawnTimer++;
    if (state.spawnTimer >= BLACK_HOLE.SPAWN_INTERVAL) {
        spawnBlackHole();
        state.spawnTimer = 0;
    }

    // Only move black holes if time freeze is not active
    const scrollSpeed = effects.timeFreeze.active ? 0 : PHYSICS.SCROLL_SPEED;

    for (let i = blackHoles.length - 1; i >= 0; i--) {
        blackHoles[i].y += scrollSpeed;
        blackHoles[i].rotation += 0.03;

        if (blackHoles[i].y > CANVAS.HEIGHT + blackHoles[i].radius) {
            blackHoles.splice(i, 1);
        }
    }
}

export function checkBlackHoleCollision() {
    if (state.effects.shield.active) return null;
    
    const { ball, blackHoles } = state;
    
    for (const hole of blackHoles) {
        const dx = ball.x - hole.x;
        const dy = ball.y - hole.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < hole.radius * 0.5) {
            return hole;
        }
    }
    return null;
}

export function applyBlackHoleGravity() {
    const { ball, blackHoles, effects } = state;
    
    if (effects.shield.active) return;
    
    for (const hole of blackHoles) {
        const dx = hole.x - ball.x;
        const dy = hole.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < BLACK_HOLE.GRAVITY_RADIUS && distance > 0) {
            let strength = BLACK_HOLE.GRAVITY_STRENGTH * (1 - distance / BLACK_HOLE.GRAVITY_RADIUS) * (1 - distance / BLACK_HOLE.GRAVITY_RADIUS);
            
            // Reduce black hole gravity by 90% when magnet is active
            if (effects.magnet.active) {
                strength *= 0.1;
            }
            
            const nx = dx / distance;
            const ny = dy / distance;
            
            ball.vx += nx * strength;
            ball.vy += ny * strength;
        }
    }
}

// ==================== SUCKING ANIMATION ====================

export function startSuckingAnimation(hole) {
    const { ball } = state;
    state.beingSucked = true;
    state.suckingHole = hole;
    state.suckProgress = 0;
    state.suckStartPos = { x: ball.x, y: ball.y };
    state.suckStartRadius = ball.radius;
    state.suckParticles = [];
    state.finalTime = ((Date.now() - state.startTime) / 1000).toFixed(1);
}

export function updateSuckingAnimation() {
    if (!state.beingSucked) return false;
    
    const { ball, suckingHole, suckParticles } = state;
    
    state.suckProgress += 0.03;
    
    ball.x += (suckingHole.x - ball.x) * 0.1;
    ball.y += (suckingHole.y - ball.y) * 0.1;
    
    ball.radius = state.suckStartRadius * (1 - state.suckProgress * 0.9);
    ball.suckRotation = (ball.suckRotation || 0) + 0.3 * (1 + state.suckProgress * 3);
    
    if (Math.random() < 0.5) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        suckParticles.push({
            x: ball.x,
            y: ball.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            size: 2 + Math.random() * 4
        });
    }
    
    for (let i = suckParticles.length - 1; i >= 0; i--) {
        const p = suckParticles[i];
        const dx = suckingHole.x - p.x;
        const dy = suckingHole.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            p.vx += (dx / dist) * 0.5;
            p.vy += (dy / dist) * 0.5;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        
        if (p.life <= 0 || dist < suckingHole.radius * 0.3) {
            suckParticles.splice(i, 1);
        }
    }
    
    if (state.suckProgress >= 1) {
        ball.radius = state.suckStartRadius;
        return true;
    }
    return false;
}
