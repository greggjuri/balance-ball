// ==================== ENTITIES ====================
// Ball, Platform, and Black Holes logic

import { CANVAS, PHYSICS, BALL, BLACK_HOLE, PLATFORM, SCORE_BALL } from './config.js';
import { state } from './state.js';

// ==================== UTILITY ====================

// Generate random speed variation (±10% of base speed)
function getRandomSpeedVariation() {
    return 0.9 + Math.random() * 0.2;  // Returns 0.9 to 1.1
}

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
    
    // Start with base width
    let widthMultiplier = 1.0;
    
    // Apply wide platform power-up if active (30% wider)
    if (effects.widePlatform.active) {
        widthMultiplier *= 1.3;
    }
    
    // Apply narrow platform power-down if active (30% narrower)
    if (effects.narrowPlatform.active) {
        widthMultiplier *= 0.7;
    }
    
    platform.width = state.basePlatformWidth * widthMultiplier;
    
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
            
            // Determine roll friction based on active effects
            let currentRollFriction;
            if (effects.iceMode.active) {
                // Ice mode: super slippery (almost no friction)
                currentRollFriction = 0.9999;
            } else if (effects.magnet.active) {
                // Magnet: high friction
                currentRollFriction = PHYSICS.MAGNET_ROLL_FRICTION;
            } else {
                currentRollFriction = PHYSICS.ROLL_FRICTION;
            }
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
        state.finalScore = state.score;
        return 'fell';
    }
    return null;
}

// ==================== BLACK HOLES ====================

// Calculate black hole speed multiplier based on score
export function getBlackHoleSpeedMultiplier() {
    const increases = Math.floor(state.score / BLACK_HOLE.SPEED_INCREASE_INTERVAL);
    return Math.min(
        BLACK_HOLE.MAX_SPEED_MULTIPLIER,
        1 + increases * BLACK_HOLE.SPEED_INCREASE_AMOUNT
    );
}

export function spawnBlackHole() {
    const holeRadius = BALL.BASE_RADIUS * 2;
    const x = holeRadius + Math.random() * (CANVAS.WIDTH - holeRadius * 2);
    state.blackHoles.push({
        x: x,
        y: -holeRadius,
        radius: holeRadius,
        rotation: Math.random() * Math.PI * 2,
        speedVariation: getRandomSpeedVariation()  // ±10% random speed
    });
}

export function updateBlackHoles() {
    const { blackHoles, effects } = state;
    
    state.spawnTimer++;
    if (state.spawnTimer >= BLACK_HOLE.SPAWN_INTERVAL) {
        spawnBlackHole();
        state.spawnTimer = 0;
    }

    // Calculate speed multiplier based on score (5% faster every 20 points, max 150%)
    const scoreSpeedMultiplier = getBlackHoleSpeedMultiplier();

    for (let i = blackHoles.length - 1; i >= 0; i--) {
        const hole = blackHoles[i];
        
        // Only move black holes if time freeze is not active
        if (!effects.timeFreeze.active) {
            // Apply both score-based multiplier and individual random variation
            const scrollSpeed = PHYSICS.SCROLL_SPEED * scoreSpeedMultiplier * hole.speedVariation;
            hole.y += scrollSpeed;
        }
        
        hole.rotation += 0.03;

        if (hole.y > CANVAS.HEIGHT + hole.radius) {
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

// ==================== SCORE BALLS ====================

export function spawnScoreBall() {
    const types = Object.keys(SCORE_BALL.TYPES);
    const typeKey = types[Math.floor(Math.random() * types.length)];
    const type = SCORE_BALL.TYPES[typeKey];
    
    const radius = BALL.BASE_RADIUS * type.sizeMultiplier;
    const x = radius + Math.random() * (CANVAS.WIDTH - radius * 2);
    
    state.scoreBalls.push({
        x: x,
        y: -radius,
        radius: radius,
        points: type.points,
        speedMultiplier: type.speedMultiplier,
        color: type.color,
        glowColor: type.glowColor,
        rotation: Math.random() * Math.PI * 2,
        speedVariation: getRandomSpeedVariation()  // ±10% random speed
    });
}

export function updateScoreBalls() {
    const { scoreBalls } = state;
    
    // Spawn timer
    state.scoreBallSpawnTimer++;
    if (state.scoreBallSpawnTimer >= SCORE_BALL.SPAWN_INTERVAL) {
        spawnScoreBall();
        state.scoreBallSpawnTimer = 0;
    }

    // Move score balls (NOT affected by time freeze - only black holes freeze)
    for (let i = scoreBalls.length - 1; i >= 0; i--) {
        const sb = scoreBalls[i];
        // Apply base speed, type multiplier, and random variation
        sb.y += PHYSICS.SCROLL_SPEED * sb.speedMultiplier * sb.speedVariation;
        sb.rotation += 0.02;

        if (sb.y > CANVAS.HEIGHT + sb.radius) {
            scoreBalls.splice(i, 1);
        }
    }
}

export function checkScoreBallCollision() {
    const { ball, scoreBalls } = state;
    
    for (let i = scoreBalls.length - 1; i >= 0; i--) {
        const sb = scoreBalls[i];
        const dx = ball.x - sb.x;
        const dy = ball.y - sb.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball.radius + sb.radius) {
            state.score += sb.points;
            scoreBalls.splice(i, 1);
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
    state.finalScore = state.score;
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
