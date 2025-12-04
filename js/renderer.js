// ==================== RENDERER ====================
// All drawing and visual effects

import { CANVAS, BLACK_HOLE, BALL_COLORS, BALL } from './config.js';
import { state } from './state.js';
import { isBallVisible } from './powerups.js';

let ctx;

export function initRenderer(canvas) {
    ctx = canvas.getContext('2d');
}

// ==================== BACKGROUND ====================

export function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS.HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0d1b2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);

    ctx.strokeStyle = 'rgba(233, 69, 96, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS.WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS.HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y < CANVAS.HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS.WIDTH, y);
        ctx.stroke();
    }
}

// ==================== PLATFORM ====================

export function drawPlatform() {
    const { platform, effects } = state;
    const leftY = platform.y + platform.tilt;
    const rightY = platform.y - platform.tilt;

    // Shadow
    ctx.beginPath();
    ctx.moveTo(platform.x, leftY + 20);
    ctx.lineTo(platform.x + platform.width, rightY + 20);
    ctx.lineTo(platform.x + platform.width, rightY + 25);
    ctx.lineTo(platform.x, leftY + 25);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Glow effect based on active power-up/power-down
    if (effects.iceMode.active) {
        ctx.shadowColor = '#88ddff';
        ctx.shadowBlur = 30;
    } else if (effects.narrowPlatform.active) {
        ctx.shadowColor = '#ff3333';
        ctx.shadowBlur = 25;
    } else if (effects.magnet.active) {
        ctx.shadowColor = '#ff6b35';
        ctx.shadowBlur = 25;
    } else if (effects.timeFreeze.active) {
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 25;
    } else {
        ctx.shadowColor = '#00d9ff';
        ctx.shadowBlur = 20;
    }

    // Platform gradient
    const gradient = ctx.createLinearGradient(platform.x, leftY, platform.x + platform.width, rightY);
    if (effects.iceMode.active) {
        gradient.addColorStop(0, '#aaeeff');
        gradient.addColorStop(0.5, '#88ddff');
        gradient.addColorStop(1, '#aaeeff');
    } else if (effects.narrowPlatform.active) {
        gradient.addColorStop(0, '#ff3333');
        gradient.addColorStop(0.5, '#cc2828');
        gradient.addColorStop(1, '#ff3333');
    } else if (effects.magnet.active) {
        gradient.addColorStop(0, '#ff6b35');
        gradient.addColorStop(0.5, '#cc5528');
        gradient.addColorStop(1, '#ff6b35');
    } else if (effects.timeFreeze.active) {
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.5, '#00cccc');
        gradient.addColorStop(1, '#00ffff');
    } else {
        gradient.addColorStop(0, '#00d9ff');
        gradient.addColorStop(0.5, '#0099cc');
        gradient.addColorStop(1, '#00d9ff');
    }

    ctx.beginPath();
    ctx.moveTo(platform.x, leftY);
    ctx.lineTo(platform.x + platform.width, rightY);
    ctx.lineTo(platform.x + platform.width, rightY + platform.height);
    ctx.lineTo(platform.x, leftY + platform.height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.shadowBlur = 0;

    // Top highlight
    ctx.beginPath();
    ctx.moveTo(platform.x, leftY);
    ctx.lineTo(platform.x + platform.width, rightY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// ==================== BLACK HOLES ====================

export function drawBlackHoles() {
    const { blackHoles, effects } = state;
    
    for (const hole of blackHoles) {
        // Frozen effect
        const frozenAlpha = effects.timeFreeze.active ? 0.5 : 1;
        
        // Gravity field
        const gravityGradient = ctx.createRadialGradient(
            hole.x, hole.y, hole.radius,
            hole.x, hole.y, BLACK_HOLE.GRAVITY_RADIUS
        );
        gravityGradient.addColorStop(0, `rgba(100, 0, 150, ${0.15 * frozenAlpha})`);
        gravityGradient.addColorStop(0.5, `rgba(60, 0, 100, ${0.05 * frozenAlpha})`);
        gravityGradient.addColorStop(1, 'rgba(40, 0, 80, 0)');
        
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, BLACK_HOLE.GRAVITY_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = gravityGradient;
        ctx.fill();
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
            hole.x, hole.y, 0,
            hole.x, hole.y, hole.radius * 1.5
        );
        
        if (effects.timeFreeze.active) {
            gradient.addColorStop(0, 'rgba(0, 100, 100, 1)');
            gradient.addColorStop(0.5, 'rgba(0, 80, 80, 0.8)');
            gradient.addColorStop(0.7, 'rgba(0, 150, 150, 0.4)');
            gradient.addColorStop(1, 'rgba(0, 200, 200, 0)');
        } else {
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(0.5, 'rgba(20, 0, 40, 0.8)');
            gradient.addColorStop(0.7, 'rgba(60, 0, 100, 0.4)');
            gradient.addColorStop(1, 'rgba(100, 0, 150, 0)');
        }

        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
        ctx.fillStyle = effects.timeFreeze.active ? '#004444' : '#000';
        ctx.fill();

        // Swirl effect
        ctx.save();
        ctx.translate(hole.x, hole.y);
        ctx.rotate(hole.rotation);
        
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, hole.radius * 0.7, i * Math.PI * 2 / 3, i * Math.PI * 2 / 3 + Math.PI / 2);
            const swirlColor = effects.timeFreeze.active 
                ? `rgba(0, 255, 255, ${0.5 - i * 0.15})`
                : `rgba(150, 50, 255, ${0.5 - i * 0.15})`;
            ctx.strokeStyle = swirlColor;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        ctx.restore();

        // Inner glow
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.radius * 0.3, 0, Math.PI * 2);
        const innerGradient = ctx.createRadialGradient(
            hole.x, hole.y, 0,
            hole.x, hole.y, hole.radius * 0.3
        );
        if (effects.timeFreeze.active) {
            innerGradient.addColorStop(0, 'rgba(0, 200, 200, 0.5)');
            innerGradient.addColorStop(1, 'rgba(0, 50, 50, 1)');
        } else {
            innerGradient.addColorStop(0, 'rgba(100, 0, 150, 0.5)');
            innerGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        }
        ctx.fillStyle = innerGradient;
        ctx.fill();
        
        // Frozen indicator
        if (effects.timeFreeze.active) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius * 1.2, 0, Math.PI * 2);
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}

// ==================== SCORE BALLS ====================

export function drawScoreBalls() {
    const { scoreBalls, effects } = state;
    
    for (const sb of scoreBalls) {
        ctx.save();
        ctx.translate(sb.x, sb.y);
        ctx.rotate(sb.rotation);
        
        // Frozen effect
        const frozenAlpha = effects.timeFreeze.active ? 0.6 : 1;
        
        // Outer glow
        const pulse = Math.sin(Date.now() * 0.008 + sb.x) * 0.15 + 1;
        ctx.shadowColor = sb.glowColor;
        ctx.shadowBlur = 15 * pulse;
        
        const glowGradient = ctx.createRadialGradient(0, 0, sb.radius * 0.3, 0, 0, sb.radius * 1.4 * pulse);
        glowGradient.addColorStop(0, sb.color + '66');
        glowGradient.addColorStop(1, sb.color + '00');
        ctx.beginPath();
        ctx.arc(0, 0, sb.radius * 1.4 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();
        
        // Main ball
        const ballGradient = ctx.createRadialGradient(-sb.radius * 0.3, -sb.radius * 0.3, 0, 0, 0, sb.radius);
        ballGradient.addColorStop(0, '#ffffff');
        ballGradient.addColorStop(0.3, sb.color);
        ballGradient.addColorStop(1, sb.glowColor);
        
        ctx.globalAlpha = frozenAlpha;
        ctx.beginPath();
        ctx.arc(0, 0, sb.radius, 0, Math.PI * 2);
        ctx.fillStyle = ballGradient;
        ctx.fill();
        
        // Inner shine
        ctx.beginPath();
        ctx.arc(-sb.radius * 0.25, -sb.radius * 0.25, sb.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
        
        // Points number
        ctx.shadowBlur = 0;
        ctx.globalAlpha = frozenAlpha;
        ctx.fillStyle = '#000';
        ctx.font = `bold ${sb.radius * 0.9}px Orbitron, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sb.points.toString(), 0, 2);
        
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

// ==================== POWER-UPS ====================

export function drawPowerUps() {
    const { powerUps } = state;
    
    for (const pu of powerUps) {
        ctx.save();
        ctx.translate(pu.x, pu.y);
        
        if (pu.type !== 'shield') {
            ctx.rotate(pu.rotation);
        }

        switch (pu.type) {
            case 'shield':
                drawShieldPowerUp(pu);
                break;
            case 'widePlatform':
                drawWidePlatformPowerUp(pu);
                break;
            case 'magnet':
                drawMagnetPowerUp(pu);
                break;
            case 'shrinkBall':
                drawShrinkBallPowerUp(pu);
                break;
            case 'bigBallz':
                drawBigBallzPowerUp(pu);
                break;
            case 'timeFreeze':
                drawTimeFreezePowerUp(pu);
                break;
            case 'narrowPlatform':
                drawNarrowPlatformPowerUp(pu);
                break;
            case 'iceMode':
                drawIceModePowerUp(pu);
                break;
            case 'blinkingEye':
                drawBlinkingEyePowerUp(pu);
                break;
            case 'earthquake':
                drawEarthquakePowerUp(pu);
                break;
        }

        ctx.restore();
    }
}

function drawShieldPowerUp(pu) {
    const pulse = Math.sin(Date.now() * 0.005) * 0.15 + 1;
    
    ctx.shadowColor = '#4a90d9';
    ctx.shadowBlur = 15 * pulse;

    // Outer glow
    const glowGradient = ctx.createRadialGradient(0, 0, pu.radius * 0.5, 0, 0, pu.radius * 1.5 * pulse);
    glowGradient.addColorStop(0, 'rgba(74, 144, 217, 0.4)');
    glowGradient.addColorStop(1, 'rgba(74, 144, 217, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius * 1.5 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Shield shape
    ctx.beginPath();
    ctx.moveTo(-pu.radius * 0.9, -pu.radius * 0.8);
    ctx.lineTo(pu.radius * 0.9, -pu.radius * 0.8);
    ctx.quadraticCurveTo(pu.radius * 1.1, -pu.radius * 0.6, pu.radius * 1.0, -pu.radius * 0.2);
    ctx.quadraticCurveTo(pu.radius * 0.8, pu.radius * 0.5, 0, pu.radius * 1.1);
    ctx.quadraticCurveTo(-pu.radius * 0.8, pu.radius * 0.5, -pu.radius * 1.0, -pu.radius * 0.2);
    ctx.quadraticCurveTo(-pu.radius * 1.1, -pu.radius * 0.6, -pu.radius * 0.9, -pu.radius * 0.8);
    ctx.closePath();

    const shieldGradient = ctx.createLinearGradient(0, -pu.radius, 0, pu.radius);
    shieldGradient.addColorStop(0, '#e8f4fc');
    shieldGradient.addColorStop(0.3, '#4a90d9');
    shieldGradient.addColorStop(0.7, '#2e5a8b');
    shieldGradient.addColorStop(1, '#1a3a5c');
    ctx.fillStyle = shieldGradient;
    ctx.fill();

    ctx.strokeStyle = '#a0c4e8';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawWidePlatformPowerUp(pu) {
    const pulse = Math.sin(Date.now() * 0.005) * 0.15 + 1;
    
    ctx.shadowColor = '#00d9ff';
    ctx.shadowBlur = 15 * pulse;

    const glowGradient = ctx.createRadialGradient(0, 0, pu.radius * 0.5, 0, 0, pu.radius * 1.5 * pulse);
    glowGradient.addColorStop(0, 'rgba(0, 217, 255, 0.4)');
    glowGradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius * 1.5 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    const barWidth = pu.radius * 1.6;
    const barHeight = pu.radius * 0.4;
    
    ctx.beginPath();
    ctx.roundRect(-barWidth/2, -barHeight/2, barWidth, barHeight, 3);
    const barGradient = ctx.createLinearGradient(0, -barHeight/2, 0, barHeight/2);
    barGradient.addColorStop(0, '#80ecff');
    barGradient.addColorStop(0.5, '#00d9ff');
    barGradient.addColorStop(1, '#0099cc');
    ctx.fillStyle = barGradient;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Arrows pointing outward
    ctx.beginPath();
    ctx.moveTo(-barWidth/2 - 6, 0);
    ctx.lineTo(-barWidth/2 - 2, -5);
    ctx.lineTo(-barWidth/2 - 2, 5);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(barWidth/2 + 6, 0);
    ctx.lineTo(barWidth/2 + 2, -5);
    ctx.lineTo(barWidth/2 + 2, 5);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
}

function drawNarrowPlatformPowerUp(pu) {
    const pulse = Math.sin(Date.now() * 0.008) * 0.2 + 1;  // Faster, more aggressive pulse
    
    ctx.shadowColor = '#ff3333';
    ctx.shadowBlur = 18 * pulse;

    // Outer glow - red/warning color
    const glowGradient = ctx.createRadialGradient(0, 0, pu.radius * 0.5, 0, 0, pu.radius * 1.5 * pulse);
    glowGradient.addColorStop(0, 'rgba(255, 51, 51, 0.5)');
    glowGradient.addColorStop(1, 'rgba(255, 51, 51, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius * 1.5 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    const barWidth = pu.radius * 1.2;  // Narrower bar to represent shrinking
    const barHeight = pu.radius * 0.4;
    
    ctx.beginPath();
    ctx.roundRect(-barWidth/2, -barHeight/2, barWidth, barHeight, 3);
    const barGradient = ctx.createLinearGradient(0, -barHeight/2, 0, barHeight/2);
    barGradient.addColorStop(0, '#ff6666');
    barGradient.addColorStop(0.5, '#ff3333');
    barGradient.addColorStop(1, '#cc2828');
    ctx.fillStyle = barGradient;
    ctx.fill();
    ctx.strokeStyle = '#ffaaaa';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Arrows pointing inward (opposite of wide platform)
    ctx.beginPath();
    ctx.moveTo(-barWidth/2 - 8, 0);
    ctx.lineTo(-barWidth/2 - 4, -5);
    ctx.lineTo(-barWidth/2 - 4, 5);
    ctx.closePath();
    ctx.fillStyle = '#ffaaaa';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(barWidth/2 + 8, 0);
    ctx.lineTo(barWidth/2 + 4, -5);
    ctx.lineTo(barWidth/2 + 4, 5);
    ctx.closePath();
    ctx.fill();

    // Warning "X" or skull indicator in center
    ctx.strokeStyle = '#880000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-3, -3);
    ctx.lineTo(3, 3);
    ctx.moveTo(3, -3);
    ctx.lineTo(-3, 3);
    ctx.stroke();

    ctx.shadowBlur = 0;
}

function drawIceModePowerUp(pu) {
    const pulse = Math.sin(Date.now() * 0.006) * 0.15 + 1;
    
    ctx.shadowColor = '#88ddff';
    ctx.shadowBlur = 18 * pulse;

    // Outer glow - icy blue
    const glowGradient = ctx.createRadialGradient(0, 0, pu.radius * 0.5, 0, 0, pu.radius * 1.5 * pulse);
    glowGradient.addColorStop(0, 'rgba(136, 221, 255, 0.5)');
    glowGradient.addColorStop(1, 'rgba(136, 221, 255, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius * 1.5 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Ice cube shape
    const cubeSize = pu.radius * 0.9;
    const cubeGradient = ctx.createLinearGradient(-cubeSize, -cubeSize, cubeSize, cubeSize);
    cubeGradient.addColorStop(0, '#ffffff');
    cubeGradient.addColorStop(0.3, '#ccf4ff');
    cubeGradient.addColorStop(0.6, '#88ddff');
    cubeGradient.addColorStop(1, '#55bbdd');
    
    // Main cube body
    ctx.beginPath();
    ctx.roundRect(-cubeSize/2, -cubeSize/2, cubeSize, cubeSize, 3);
    ctx.fillStyle = cubeGradient;
    ctx.fill();
    ctx.strokeStyle = '#aaeeff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ice crystal highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    
    // Diagonal crack lines
    ctx.beginPath();
    ctx.moveTo(-cubeSize * 0.3, -cubeSize * 0.3);
    ctx.lineTo(cubeSize * 0.1, cubeSize * 0.1);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(cubeSize * 0.2, -cubeSize * 0.35);
    ctx.lineTo(cubeSize * 0.35, -cubeSize * 0.1);
    ctx.stroke();

    // Snowflake sparkles around
    ctx.fillStyle = '#ffffff';
    const sparklePositions = [
        [-pu.radius * 0.8, -pu.radius * 0.6],
        [pu.radius * 0.7, -pu.radius * 0.7],
        [-pu.radius * 0.6, pu.radius * 0.8],
        [pu.radius * 0.8, pu.radius * 0.5]
    ];
    
    for (const [sx, sy] of sparklePositions) {
        const sparkle = Math.sin(Date.now() * 0.01 + sx) * 0.5 + 0.5;
        ctx.globalAlpha = sparkle * 0.8;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.shadowBlur = 0;
}

function drawBlinkingEyePowerUp(pu) {
    const pulse = Math.sin(Date.now() * 0.008) * 0.2 + 1;
    const blink = Math.sin(Date.now() * 0.006) * 0.5 + 0.5;  // Blinking animation
    
    ctx.shadowColor = '#ff66ff';
    ctx.shadowBlur = 18 * pulse;

    // Outer glow - magenta/pink
    const glowGradient = ctx.createRadialGradient(0, 0, pu.radius * 0.5, 0, 0, pu.radius * 1.5 * pulse);
    glowGradient.addColorStop(0, 'rgba(255, 102, 255, 0.5)');
    glowGradient.addColorStop(1, 'rgba(255, 102, 255, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius * 1.5 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Eye white (ellipse shape)
    const eyeWidth = pu.radius * 1.4;
    const eyeHeight = pu.radius * 0.9 * (0.3 + blink * 0.7);  // Blinks closed periodically
    
    ctx.beginPath();
    ctx.ellipse(0, 0, eyeWidth / 2, eyeHeight / 2, 0, 0, Math.PI * 2);
    const eyeGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, eyeWidth / 2);
    eyeGradient.addColorStop(0, '#ffffff');
    eyeGradient.addColorStop(0.8, '#ffeeee');
    eyeGradient.addColorStop(1, '#ffcccc');
    ctx.fillStyle = eyeGradient;
    ctx.fill();
    ctx.strokeStyle = '#cc66cc';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Iris (only visible when eye is open enough)
    if (blink > 0.3) {
        const irisRadius = pu.radius * 0.35 * Math.min(1, blink * 1.5);
        ctx.beginPath();
        ctx.arc(0, 0, irisRadius, 0, Math.PI * 2);
        const irisGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, irisRadius);
        irisGradient.addColorStop(0, '#ff00ff');
        irisGradient.addColorStop(0.5, '#cc00cc');
        irisGradient.addColorStop(1, '#990099');
        ctx.fillStyle = irisGradient;
        ctx.fill();

        // Pupil
        if (blink > 0.5) {
            const pupilRadius = pu.radius * 0.15;
            ctx.beginPath();
            ctx.arc(0, 0, pupilRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();

            // Eye glint
            ctx.beginPath();
            ctx.arc(-pupilRadius * 0.5, -pupilRadius * 0.5, pupilRadius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        }
    }

    // Eyelid lines when blinking
    if (blink < 0.5) {
        ctx.strokeStyle = '#cc66cc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-eyeWidth / 2, 0);
        ctx.lineTo(eyeWidth / 2, 0);
        ctx.stroke();
    }

    ctx.shadowBlur = 0;
}

function drawEarthquakePowerUp(pu) {
    const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 1;  // Faster shake pulse
    const shake = Math.sin(Date.now() * 0.05) * 2;  // Shaking offset
    
    ctx.shadowColor = '#8b4513';
    ctx.shadowBlur = 18 * pulse;

    // Outer glow - earthy brown/orange
    const glowGradient = ctx.createRadialGradient(0, 0, pu.radius * 0.5, 0, 0, pu.radius * 1.5 * pulse);
    glowGradient.addColorStop(0, 'rgba(139, 69, 19, 0.5)');
    glowGradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius * 1.5 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Ground/crack base circle
    const baseGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pu.radius);
    baseGradient.addColorStop(0, '#d2691e');
    baseGradient.addColorStop(0.5, '#8b4513');
    baseGradient.addColorStop(1, '#654321');
    
    ctx.beginPath();
    ctx.arc(shake * 0.3, 0, pu.radius * 0.9, 0, Math.PI * 2);
    ctx.fillStyle = baseGradient;
    ctx.fill();
    ctx.strokeStyle = '#a0522d';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Crack lines radiating from center
    ctx.strokeStyle = '#3d2314';
    ctx.lineWidth = 2;
    
    // Main vertical crack
    ctx.beginPath();
    ctx.moveTo(shake * 0.5, -pu.radius * 0.7);
    ctx.lineTo(shake * 0.2, -pu.radius * 0.2);
    ctx.lineTo(shake * 0.4, pu.radius * 0.1);
    ctx.lineTo(shake * 0.1, pu.radius * 0.6);
    ctx.stroke();
    
    // Left crack
    ctx.beginPath();
    ctx.moveTo(shake * 0.2, -pu.radius * 0.2);
    ctx.lineTo(-pu.radius * 0.5 + shake, -pu.radius * 0.3);
    ctx.stroke();
    
    // Right crack
    ctx.beginPath();
    ctx.moveTo(shake * 0.4, pu.radius * 0.1);
    ctx.lineTo(pu.radius * 0.6 + shake, pu.radius * 0.2);
    ctx.stroke();

    // Vibration lines around the circle
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.6)';
    ctx.lineWidth = 1.5;
    
    for (let i = 0; i < 3; i++) {
        const offset = (i + 1) * 4;
        const waveOffset = Math.sin(Date.now() * 0.02 + i) * 2;
        
        // Left vibration lines
        ctx.beginPath();
        ctx.moveTo(-pu.radius - offset + waveOffset, -pu.radius * 0.3);
        ctx.lineTo(-pu.radius - offset - 2 + waveOffset, 0);
        ctx.lineTo(-pu.radius - offset + waveOffset, pu.radius * 0.3);
        ctx.stroke();
        
        // Right vibration lines
        ctx.beginPath();
        ctx.moveTo(pu.radius + offset + waveOffset, -pu.radius * 0.3);
        ctx.lineTo(pu.radius + offset + 2 + waveOffset, 0);
        ctx.lineTo(pu.radius + offset + waveOffset, pu.radius * 0.3);
        ctx.stroke();
    }

    ctx.shadowBlur = 0;
}

function drawMagnetPowerUp(pu) {
    const pulse = Math.sin(Date.now() * 0.005) * 0.15 + 1;
    
    ctx.shadowColor = '#ff6b35';
    ctx.shadowBlur = 15 * pulse;

    const glowGradient = ctx.createRadialGradient(0, 0, pu.radius * 0.5, 0, 0, pu.radius * 1.5 * pulse);
    glowGradient.addColorStop(0, 'rgba(255, 107, 53, 0.4)');
    glowGradient.addColorStop(1, 'rgba(255, 107, 53, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius * 1.5 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    const magnetRadius = pu.radius * 0.8;
    const magnetThickness = pu.radius * 0.35;
    
    ctx.beginPath();
    ctx.arc(0, 0, magnetRadius, Math.PI, 0, false);
    ctx.lineTo(magnetRadius, pu.radius * 0.6);
    ctx.lineTo(magnetRadius - magnetThickness, pu.radius * 0.6);
    ctx.arc(0, 0, magnetRadius - magnetThickness, 0, Math.PI, true);
    ctx.lineTo(-magnetRadius + magnetThickness, pu.radius * 0.6);
    ctx.lineTo(-magnetRadius, pu.radius * 0.6);
    ctx.closePath();

    const magnetGradient = ctx.createLinearGradient(-magnetRadius, 0, magnetRadius, 0);
    magnetGradient.addColorStop(0, '#ff4444');
    magnetGradient.addColorStop(0.3, '#ff6b35');
    magnetGradient.addColorStop(0.5, '#ffaa00');
    magnetGradient.addColorStop(0.7, '#ff6b35');
    magnetGradient.addColorStop(1, '#ff4444');
    ctx.fillStyle = magnetGradient;
    ctx.fill();

    ctx.strokeStyle = '#ffccaa';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Poles
    ctx.beginPath();
    ctx.rect(-magnetRadius, pu.radius * 0.3, magnetThickness, pu.radius * 0.3);
    ctx.fillStyle = '#cc0000';
    ctx.fill();
    
    ctx.beginPath();
    ctx.rect(magnetRadius - magnetThickness, pu.radius * 0.3, magnetThickness, pu.radius * 0.3);
    ctx.fillStyle = '#0066cc';
    ctx.fill();

    ctx.shadowBlur = 0;
}

function drawShrinkBallPowerUp(pu) {
    const pulse = Math.sin(Date.now() * 0.005) * 0.15 + 1;
    
    ctx.shadowColor = '#9932ff';
    ctx.shadowBlur = 15 * pulse;

    const glowGradient = ctx.createRadialGradient(0, 0, pu.radius * 0.5, 0, 0, pu.radius * 1.5 * pulse);
    glowGradient.addColorStop(0, 'rgba(153, 50, 255, 0.4)');
    glowGradient.addColorStop(1, 'rgba(153, 50, 255, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius * 1.5 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    const ballRadius = pu.radius * 0.6;
    const ballGradient = ctx.createRadialGradient(-ballRadius * 0.3, -ballRadius * 0.3, 0, 0, 0, ballRadius);
    ballGradient.addColorStop(0, '#cc88ff');
    ballGradient.addColorStop(0.5, '#9932ff');
    ballGradient.addColorStop(1, '#6600cc');
    
    ctx.beginPath();
    ctx.arc(0, 0, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = ballGradient;
    ctx.fill();
    ctx.strokeStyle = '#ddaaff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inward arrows
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    const arrowDist = pu.radius * 1.1;
    const arrowSize = 4;
    
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI / 2) + Math.PI / 4;
        const ax = Math.cos(angle) * arrowDist;
        const ay = Math.sin(angle) * arrowDist;
        const tx = Math.cos(angle) * (ballRadius + 2);
        const ty = Math.sin(angle) * (ballRadius + 2);
        
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        
        const headAngle = angle + Math.PI;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + Math.cos(headAngle - 0.5) * arrowSize, ty + Math.sin(headAngle - 0.5) * arrowSize);
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + Math.cos(headAngle + 0.5) * arrowSize, ty + Math.sin(headAngle + 0.5) * arrowSize);
        ctx.stroke();
    }

    ctx.shadowBlur = 0;
}

function drawBigBallzPowerUp(pu) {
    const pulse = Math.sin(Date.now() * 0.005) * 0.15 + 1;
    
    ctx.shadowColor = '#ff8c00';
    ctx.shadowBlur = 15 * pulse;

    // Outer glow
    const glowGradient = ctx.createRadialGradient(0, 0, pu.radius * 0.5, 0, 0, pu.radius * 1.5 * pulse);
    glowGradient.addColorStop(0, 'rgba(255, 140, 0, 0.4)');
    glowGradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius * 1.5 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Basketball-style ball
    const ballRadius = pu.radius * 0.8;
    const ballGradient = ctx.createRadialGradient(-ballRadius * 0.3, -ballRadius * 0.3, 0, 0, 0, ballRadius);
    ballGradient.addColorStop(0, '#ffaa44');
    ballGradient.addColorStop(0.5, '#ff8c00');
    ballGradient.addColorStop(1, '#cc6600');
    
    ctx.beginPath();
    ctx.arc(0, 0, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = ballGradient;
    ctx.fill();
    ctx.strokeStyle = '#ffcc88';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Basketball lines
    ctx.strokeStyle = '#804400';
    ctx.lineWidth = 1.5;
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(-ballRadius, 0);
    ctx.lineTo(ballRadius, 0);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(0, -ballRadius);
    ctx.lineTo(0, ballRadius);
    ctx.stroke();
    
    // Curved lines
    ctx.beginPath();
    ctx.arc(-ballRadius * 0.3, 0, ballRadius * 0.7, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(ballRadius * 0.3, 0, ballRadius * 0.7, Math.PI * 0.6, Math.PI * 1.4);
    ctx.stroke();

    // Outward arrows to indicate growth
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    const arrowDist = ballRadius + 2;
    const arrowEnd = pu.radius * 1.15;
    const arrowSize = 4;
    
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI / 2) + Math.PI / 4;
        const sx = Math.cos(angle) * arrowDist;
        const sy = Math.sin(angle) * arrowDist;
        const ex = Math.cos(angle) * arrowEnd;
        const ey = Math.sin(angle) * arrowEnd;
        
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        
        // Arrowhead pointing outward
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex + Math.cos(angle + Math.PI - 0.5) * arrowSize, ey + Math.sin(angle + Math.PI - 0.5) * arrowSize);
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex + Math.cos(angle + Math.PI + 0.5) * arrowSize, ey + Math.sin(angle + Math.PI + 0.5) * arrowSize);
        ctx.stroke();
    }

    ctx.shadowBlur = 0;
}

function drawTimeFreezePowerUp(pu) {
    const pulse = Math.sin(Date.now() * 0.005) * 0.15 + 1;
    
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15 * pulse;

    // Outer glow
    const glowGradient = ctx.createRadialGradient(0, 0, pu.radius * 0.5, 0, 0, pu.radius * 1.5 * pulse);
    glowGradient.addColorStop(0, 'rgba(0, 255, 255, 0.4)');
    glowGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius * 1.5 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Clock face
    const clockRadius = pu.radius * 0.85;
    const clockGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, clockRadius);
    clockGradient.addColorStop(0, '#66ffff');
    clockGradient.addColorStop(0.5, '#00dddd');
    clockGradient.addColorStop(1, '#008888');
    
    ctx.beginPath();
    ctx.arc(0, 0, clockRadius, 0, Math.PI * 2);
    ctx.fillStyle = clockGradient;
    ctx.fill();
    ctx.strokeStyle = '#aaffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Clock marks
    ctx.strokeStyle = '#004444';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI / 6) - Math.PI / 2;
        const innerR = clockRadius * 0.75;
        const outerR = clockRadius * 0.9;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
        ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
        ctx.stroke();
    }

    // Clock hands (frozen at specific position)
    ctx.strokeStyle = '#003333';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Hour hand
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(clockRadius * 0.4, -clockRadius * 0.2);
    ctx.stroke();
    
    // Minute hand
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-clockRadius * 0.1, -clockRadius * 0.55);
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#003333';
    ctx.fill();

    // Pause bars overlay
    ctx.fillStyle = 'rgba(0, 50, 50, 0.7)';
    const barWidth = pu.radius * 0.2;
    const barHeight = pu.radius * 0.6;
    const barGap = pu.radius * 0.15;
    ctx.fillRect(-barGap - barWidth, -barHeight/2, barWidth, barHeight);
    ctx.fillRect(barGap, -barHeight/2, barWidth, barHeight);

    ctx.shadowBlur = 0;
    ctx.lineCap = 'butt';
}

// ==================== BALL & EFFECTS ====================

export function drawTrail() {
    const { trail, ball, settings, effects } = state;
    
    // Don't draw trail when ball is invisible (blinking eye effect)
    if (effects.blinkingEye.active && !isBallVisible()) {
        return;
    }
    
    const colorConfig = BALL_COLORS[settings.ballColor];
    const baseColor = colorConfig.gradient[1];
    let r = 233, g = 69, b = 96;
    
    if (baseColor.startsWith('#')) {
        r = parseInt(baseColor.slice(1, 3), 16);
        g = parseInt(baseColor.slice(3, 5), 16);
        b = parseInt(baseColor.slice(5, 7), 16);
    }
    
    for (let i = 0; i < trail.length; i++) {
        const alpha = i / trail.length * 0.4;
        const size = ball.radius * (i / trail.length) * 0.8;
        
        ctx.beginPath();
        ctx.arc(trail[i].x, trail[i].y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
    }
}

export function drawSuckParticles() {
    const { suckParticles, settings } = state;
    const colorConfig = BALL_COLORS[settings.ballColor];
    
    for (const p of suckParticles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        const baseColor = colorConfig.gradient[1];
        if (baseColor.startsWith('#')) {
            const r = parseInt(baseColor.slice(1, 3), 16);
            const g = parseInt(baseColor.slice(3, 5), 16);
            const b = parseInt(baseColor.slice(5, 7), 16);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.life * 0.8})`;
        }
        ctx.fill();
    }
}

export function drawShieldEffect() {
    const { ball, effects } = state;
    if (!effects.shield.active) return;
    
    // Don't draw shield effect if ball is invisible
    if (effects.blinkingEye.active && !isBallVisible()) return;

    const remaining = effects.shield.endTime - Date.now();
    const pulseSpeed = remaining < 2000 ? 0.3 : 0.1;
    const pulse = Math.sin(Date.now() * pulseSpeed) * 0.2 + 0.8;

    ctx.save();
    
    const auraRadius = ball.radius * 1.8 * pulse;
    const gradient = ctx.createRadialGradient(ball.x, ball.y, ball.radius, ball.x, ball.y, auraRadius);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
    gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, auraRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius * 1.4, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.6 * pulse})`;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
}

export function drawMagnetEffect() {
    const { ball, effects } = state;
    if (!effects.magnet.active) return;
    
    // Don't draw magnet effect if ball is invisible
    if (effects.blinkingEye.active && !isBallVisible()) return;

    const remaining = effects.magnet.endTime - Date.now();
    const pulseSpeed = remaining < 2000 ? 0.3 : 0.1;
    const pulse = Math.sin(Date.now() * pulseSpeed) * 0.15 + 0.85;

    ctx.save();

    const numLines = 6;
    for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2 + Date.now() * 0.002;
        const innerRadius = ball.radius * 1.2;
        const outerRadius = ball.radius * 1.6 * pulse;
        
        const x1 = ball.x + Math.cos(angle) * innerRadius;
        const y1 = ball.y + Math.sin(angle) * innerRadius;
        const x2 = ball.x + Math.cos(angle) * outerRadius;
        const y2 = ball.y + Math.sin(angle) * outerRadius;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(255, 107, 53, ${0.4 * pulse})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius * 1.5 * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 107, 53, ${0.3 * pulse})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

export function drawTimeFreezeEffect() {
    const { effects } = state;
    if (!effects.timeFreeze.active) return;

    const remaining = effects.timeFreeze.endTime - Date.now();
    const pulseSpeed = remaining < 2000 ? 0.3 : 0.1;
    const pulse = Math.sin(Date.now() * pulseSpeed) * 0.1 + 0.9;

    ctx.save();
    
    // Screen edge glow effect
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS.HEIGHT);
    gradient.addColorStop(0, `rgba(0, 255, 255, ${0.15 * pulse})`);
    gradient.addColorStop(0.1, 'rgba(0, 255, 255, 0)');
    gradient.addColorStop(0.9, 'rgba(0, 255, 255, 0)');
    gradient.addColorStop(1, `rgba(0, 255, 255, ${0.15 * pulse})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
    
    // Side gradients
    const sideGradient = ctx.createLinearGradient(0, 0, CANVAS.WIDTH, 0);
    sideGradient.addColorStop(0, `rgba(0, 255, 255, ${0.1 * pulse})`);
    sideGradient.addColorStop(0.05, 'rgba(0, 255, 255, 0)');
    sideGradient.addColorStop(0.95, 'rgba(0, 255, 255, 0)');
    sideGradient.addColorStop(1, `rgba(0, 255, 255, ${0.1 * pulse})`);
    
    ctx.fillStyle = sideGradient;
    ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);

    ctx.restore();
}

export function drawBlinkingEyeEffect() {
    const { effects } = state;
    if (!effects.blinkingEye.active) return;

    const remaining = effects.blinkingEye.endTime - Date.now();
    const pulseSpeed = remaining < 2000 ? 0.3 : 0.1;
    const pulse = Math.sin(Date.now() * pulseSpeed) * 0.1 + 0.9;

    // Only show screen effect when ball is invisible
    if (!isBallVisible()) {
        ctx.save();
        
        // Subtle magenta screen edge glow when ball is invisible
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS.HEIGHT);
        gradient.addColorStop(0, `rgba(255, 102, 255, ${0.1 * pulse})`);
        gradient.addColorStop(0.1, 'rgba(255, 102, 255, 0)');
        gradient.addColorStop(0.9, 'rgba(255, 102, 255, 0)');
        gradient.addColorStop(1, `rgba(255, 102, 255, ${0.1 * pulse})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);

        ctx.restore();
    }
}

export function drawEarthquakeEffect() {
    const { effects } = state;
    if (!effects.earthquake.active) return;

    const remaining = effects.earthquake.endTime - Date.now();
    const pulseSpeed = remaining < 2000 ? 0.3 : 0.1;
    const pulse = Math.sin(Date.now() * pulseSpeed) * 0.15 + 0.85;
    
    ctx.save();
    
    // Strong brown/earthy edge glow during earthquake
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS.HEIGHT);
    gradient.addColorStop(0, `rgba(139, 69, 19, ${0.2 * pulse})`);
    gradient.addColorStop(0.1, 'rgba(139, 69, 19, 0)');
    gradient.addColorStop(0.88, 'rgba(139, 69, 19, 0)');
    gradient.addColorStop(1, `rgba(139, 69, 19, ${0.35 * pulse})`);  // Much stronger at bottom
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
    
    // Side gradients - more visible
    const sideGradient = ctx.createLinearGradient(0, 0, CANVAS.WIDTH, 0);
    sideGradient.addColorStop(0, `rgba(139, 69, 19, ${0.15 * pulse})`);
    sideGradient.addColorStop(0.06, 'rgba(139, 69, 19, 0)');
    sideGradient.addColorStop(0.94, 'rgba(139, 69, 19, 0)');
    sideGradient.addColorStop(1, `rgba(139, 69, 19, ${0.15 * pulse})`);
    
    ctx.fillStyle = sideGradient;
    ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);

    ctx.restore();
}

export function drawBall() {
    const { ball, effects, settings, beingSucked } = state;
    
    // Check if ball should be invisible (blinking eye effect)
    if (effects.blinkingEye.active && !isBallVisible() && !beingSucked) {
        // Draw a faint ghost outline so player knows roughly where ball is
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#ff66ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        return;  // Don't draw full ball
    }
    
    const colorConfig = BALL_COLORS[settings.ballColor];
    
    // Shadow
    if (!beingSucked) {
        ctx.beginPath();
        ctx.ellipse(ball.x + 5, ball.y + ball.radius + 5, ball.radius * 0.8, ball.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
    }

    // Glow color based on effects
    if (effects.shield.active && !beingSucked) {
        ctx.shadowColor = '#ffd700';
    } else if (effects.magnet.active && !beingSucked) {
        ctx.shadowColor = '#ff6b35';
    } else {
        ctx.shadowColor = beingSucked ? colorConfig.suckGlow : colorConfig.glow;
    }
    ctx.shadowBlur = beingSucked ? 35 : (effects.shield.active || effects.magnet.active ? 30 : 25);

    ctx.save();
    
    if (beingSucked && ball.suckRotation) {
        ctx.translate(ball.x, ball.y);
        ctx.rotate(ball.suckRotation);
        ctx.translate(-ball.x, -ball.y);
    }

    const gradient = ctx.createRadialGradient(
        ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0,
        ball.x, ball.y, ball.radius
    );
    
    const colors = beingSucked ? colorConfig.suckGradient : colorConfig.gradient;
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]);
    gradient.addColorStop(1, colors[2]);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.shadowBlur = 0;

    // Highlight
    ctx.beginPath();
    ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();
    
    ctx.restore();
}

// ==================== MAIN RENDER ====================

export function render() {
    drawBackground();
    drawTimeFreezeEffect();
    drawBlinkingEyeEffect();
    drawEarthquakeEffect();
    drawBlackHoles();
    drawScoreBalls();
    drawPowerUps();
    drawSuckParticles();
    drawTrail();
    drawPlatform();
    drawShieldEffect();
    drawMagnetEffect();
    drawBall();
}
