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
    const { platform, keys, effects } = state;

    if (keys.a) platform.tilt = Math.max(platform.tilt - platform.tiltSpeed, -platform.maxTilt);
    if (keys.z) platform.tilt = Math.min(platform.tilt + platform.tiltSpeed, platform.maxTilt);
    
    if (keys.n) platform.x = Math.max(platform.x - platform.moveSpeed, platform.minX);
    if (keys.m) platform.x = Math.min(platform.x + platform.moveSpeed, platform.maxX);

    if (!keys.a && !keys.z) {
        platform.tilt *= 0.96;
    }
    
    // Apply earthquake shake effect
    if (effects.earthquake.active) {
        // MAJOR earthquake - extremely violent shaking!
        const shakeIntensity = 50 + Math.sin(Date.now() * 0.015) * 30;  // 20-80 range
        platform.earthquakeShake = (Math.random() - 0.5) * shakeIntensity;
        
        // Strong horizontal position shake
        const horizontalShake = (Math.random() - 0.5) * 16;
        platform.x = Math.max(platform.minX, Math.min(platform.x + horizontalShake, platform.maxX));
    } else {
        platform.earthquakeShake = 0;
    }
}

export function getPlatformAngle() {
    const { platform } = state;
    // Include earthquake shake in the effective tilt
    const effectiveTilt = platform.tilt + (platform.earthquakeShake || 0);
    return Math.atan2(effectiveTilt * 2, platform.width);
}

export function getPlatformYAtX(x) {
    const { platform } = state;
    const centerX = platform.x + platform.width / 2;
    const relativeX = (x - centerX) / (platform.width / 2);
    // Include earthquake shake in the effective tilt
    const effectiveTilt = platform.tilt + (platform.earthquakeShake || 0);
    return platform.y - (effectiveTilt * relativeX);
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

// Update a single ball's physics, returns 'fell' if ball fell off screen
function updateSingleBall(ball, trail, trailLength) {
    const { platform, effects } = state;
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
                currentRollFriction = 0.9999;
            } else if (effects.magnet.active) {
                currentRollFriction = PHYSICS.MAGNET_ROLL_FRICTION;
            } else {
                currentRollFriction = PHYSICS.ROLL_FRICTION;
            }
            ball.vx *= currentRollFriction;
            
            if (ball.vy > 1) {
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
    if (trail.length > trailLength) {
        trail.shift();
    }

    // Check if ball fell off
    if (ball.y > CANVAS.HEIGHT + ball.radius || 
        ball.x < -ball.radius || 
        ball.x > CANVAS.WIDTH + ball.radius) {
        return 'fell';
    }
    return null;
}

export function updateBall() {
    const { ball, trail, extraBall, extraBallTrail } = state;
    
    // Update primary ball
    const primaryResult = updateSingleBall(ball, trail, BALL.TRAIL_LENGTH);
    
    // Update extra ball if exists
    let extraResult = null;
    if (extraBall) {
        extraResult = updateSingleBall(extraBall, extraBallTrail, BALL.TRAIL_LENGTH);
    }
    
    // Handle ball loss
    if (primaryResult === 'fell') {
        if (extraBall) {
            // Promote extra ball to primary
            state.ball.x = extraBall.x;
            state.ball.y = extraBall.y;
            state.ball.vx = extraBall.vx;
            state.ball.vy = extraBall.vy;
            state.ball.radius = extraBall.radius;
            state.trail.length = 0;
            state.trail.push(...extraBallTrail);
            state.extraBall = null;
            state.extraBallTrail.length = 0;
            return null; // Game continues
        } else {
            state.finalScore = state.score;
            return 'fell'; // Game over
        }
    }
    
    if (extraResult === 'fell') {
        // Just remove extra ball, game continues
        state.extraBall = null;
        state.extraBallTrail.length = 0;
        return null;
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
    
    const { ball, extraBall, blackHoles } = state;
    
    for (const hole of blackHoles) {
        // Check primary ball
        let dx = ball.x - hole.x;
        let dy = ball.y - hole.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < hole.radius * 0.5) {
            return { hole, ballType: 'primary' };
        }
        
        // Check extra ball
        if (extraBall) {
            dx = extraBall.x - hole.x;
            dy = extraBall.y - hole.y;
            distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < hole.radius * 0.5) {
                return { hole, ballType: 'extra' };
            }
        }
    }
    return null;
}

export function applyBlackHoleGravity() {
    const { ball, extraBall, blackHoles, effects } = state;
    
    if (effects.shield.active) return;
    
    // Apply gravity to a single ball
    function applyGravityToBall(targetBall) {
        for (const hole of blackHoles) {
            const dx = hole.x - targetBall.x;
            const dy = hole.y - targetBall.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < BLACK_HOLE.GRAVITY_RADIUS && distance > 0) {
                let strength = BLACK_HOLE.GRAVITY_STRENGTH * (1 - distance / BLACK_HOLE.GRAVITY_RADIUS) * (1 - distance / BLACK_HOLE.GRAVITY_RADIUS);
                
                if (effects.magnet.active) {
                    strength *= 0.1;
                }
                
                const nx = dx / distance;
                const ny = dy / distance;
                
                targetBall.vx += nx * strength;
                targetBall.vy += ny * strength;
            }
        }
    }
    
    applyGravityToBall(ball);
    if (extraBall) {
        applyGravityToBall(extraBall);
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
    const { ball, extraBall, scoreBalls } = state;
    
    for (let i = scoreBalls.length - 1; i >= 0; i--) {
        const sb = scoreBalls[i];
        
        // Check primary ball
        let dx = ball.x - sb.x;
        let dy = ball.y - sb.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball.radius + sb.radius) {
            state.score += sb.points;
            scoreBalls.splice(i, 1);
            continue;
        }
        
        // Check extra ball
        if (extraBall) {
            dx = extraBall.x - sb.x;
            dy = extraBall.y - sb.y;
            distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < extraBall.radius + sb.radius) {
                state.score += sb.points;
                scoreBalls.splice(i, 1);
            }
        }
    }
}

// ==================== EXTRA BALL ====================

export function spawnExtraBall() {
    if (state.extraBall) return; // Already have extra ball
    
    const { platform, ball } = state;
    
    // Spawn extra ball on platform, offset from primary ball
    const offsetX = ball.x < platform.x + platform.width / 2 ? 50 : -50;
    const spawnX = Math.max(platform.x + 20, Math.min(ball.x + offsetX, platform.x + platform.width - 20));
    
    state.extraBall = {
        x: spawnX,
        y: BALL.INITIAL_Y,
        radius: ball.radius,  // Same size as primary ball
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        suckRotation: 0
    };
    state.extraBallTrail = [];
}

// ==================== SUCKING ANIMATION ====================

export function startSuckingAnimation(collision) {
    const { hole, ballType } = collision;
    const targetBall = ballType === 'extra' ? state.extraBall : state.ball;
    
    // If extra ball gets sucked and we have primary, just remove extra
    if (ballType === 'extra') {
        state.extraBall = null;
        state.extraBallTrail.length = 0;
        return 'extraLost';
    }
    
    // If primary ball gets sucked and we have extra, promote extra to primary
    if (ballType === 'primary' && state.extraBall) {
        state.ball.x = state.extraBall.x;
        state.ball.y = state.extraBall.y;
        state.ball.vx = state.extraBall.vx;
        state.ball.vy = state.extraBall.vy;
        state.ball.radius = state.extraBall.radius;
        state.trail.length = 0;
        state.trail.push(...state.extraBallTrail);
        state.extraBall = null;
        state.extraBallTrail.length = 0;
        return 'primaryLostButContinue';
    }
    
    // No backup ball - start game over animation
    state.beingSucked = true;
    state.suckingHole = hole;
    state.suckProgress = 0;
    state.suckStartPos = { x: targetBall.x, y: targetBall.y };
    state.suckStartRadius = targetBall.radius;
    state.suckParticles = [];
    state.finalScore = state.score;
    return 'gameOver';
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
