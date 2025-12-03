// ==================== CANVAS & CONTEXT ====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ==================== GAME STATE ====================
let gameRunning = true;
let startTime = Date.now();
let bestTime = parseFloat(localStorage.getItem('balanceBest') || '0');
let gameOverReason = '';
let finalTime = 0;

// ==================== SETTINGS ====================
const defaultSettings = {
    ballColor: 'red',
    platformWidth: 'normal',
    soundEnabled: false,
    powerUpShield: true,
    powerUpWidePlatform: true,
    powerUpMagnet: true,
    powerUpShrinkBall: true
};
let settings = loadSettings();

// ==================== POWER-UPS STATE ====================
const powerUps = [];
let powerUpSpawnTimer = 0;
const powerUpSpawnInterval = 450; // Reduced frequency

// Active effects
let shieldActive = false;
let shieldEndTime = 0;
const shieldDuration = 7000;

let widePlatformActive = false;
let widePlatformEndTime = 0;
const widePlatformDuration = 7000;
let basePlatformWidth = 350;

let magnetActive = false;
let magnetEndTime = 0;
const magnetDuration = 7000;

let shrinkBallActive = false;
let shrinkBallEndTime = 0;
const shrinkBallDuration = 7000;
const baseBallRadius = 18;

// ==================== PLATFORM ====================
const platform = {
    x: 225,
    y: 450,
    width: 350,
    height: 12,
    tilt: 0,
    maxTilt: 80,
    tiltSpeed: 2.5,
    moveSpeed: 4,
    minX: 50,
    maxX: 400
};

// ==================== BALL ====================
const ball = {
    x: 400,
    y: 400,
    radius: 18,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    suckRotation: 0
};

// ==================== PHYSICS ====================
const gravity = 0.4;
const friction = 0.998;
const bounceFactor = 0.3;
const rollFriction = 0.9995;
const magnetRollFriction = 0.990; // Much higher friction when magnet is active

// ==================== BLACK HOLES ====================
const scrollSpeed = 1.5;
const blackHoles = [];
let spawnTimer = 0;
const spawnInterval = 200;

const blackHoleGravityRadius = 150;
const blackHoleGravityStrength = 0.15;

// Sucking animation state
let beingSucked = false;
let suckingHole = null;
let suckProgress = 0;
let suckStartPos = { x: 0, y: 0 };
let suckStartRadius = 0;
let suckParticles = [];

// ==================== INPUT ====================
const keys = {
    a: false,
    z: false,
    n: false,
    m: false
};

// Trail effect
const trail = [];
const maxTrailLength = 15;

// ==================== BALL COLORS ====================
const ballColors = {
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

// ==================== SETTINGS FUNCTIONS ====================
function loadSettings() {
    const saved = localStorage.getItem('balanceSettings');
    if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
    }
    return { ...defaultSettings };
}

function saveSettings() {
    localStorage.setItem('balanceSettings', JSON.stringify(settings));
}

function openSettings() {
    document.getElementById('settingsOverlay').classList.add('active');
    updateSettingsUI();
}

function closeSettings() {
    document.getElementById('settingsOverlay').classList.remove('active');
    saveSettings();
    applySettings();
}

function closeSettingsOnOverlay(event) {
    if (event.target.id === 'settingsOverlay') {
        closeSettings();
    }
}

function updateSettingsUI() {
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
}

function selectOption(element) {
    const setting = element.dataset.setting;
    const value = element.dataset.value;
    settings[setting] = value;
    updateSettingsUI();
}

function toggleSound() {
    settings.soundEnabled = !settings.soundEnabled;
    updateSettingsUI();
}

function togglePowerUp(type) {
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
    }
    updateSettingsUI();
}

function applySettings() {
    switch (settings.platformWidth) {
        case 'short':
            basePlatformWidth = 350 * 0.9;
            break;
        case 'wide':
            basePlatformWidth = 350 * 1.1;
            break;
        default:
            basePlatformWidth = 350;
    }
    applyPlatformWidth();
}

function applyPlatformWidth() {
    const oldWidth = platform.width;
    const centerX = platform.x + oldWidth / 2;
    
    // Apply wide platform power-up if active (30% wider)
    if (widePlatformActive) {
        platform.width = basePlatformWidth * 1.3;
    } else {
        platform.width = basePlatformWidth;
    }
    
    // Recenter platform
    platform.x = centerX - platform.width / 2;
    
    // Clamp to boundaries
    platform.maxX = 800 - platform.width - platform.minX;
    platform.x = Math.max(platform.minX, Math.min(platform.x, platform.maxX));
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = true;
        document.getElementById('key' + key.toUpperCase()).classList.add('active');
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
        document.getElementById('key' + key.toUpperCase()).classList.remove('active');
    }
    
    if (e.key === 'Enter' && !gameRunning) {
        restartGame();
    }
    
    if (e.key === 'Escape') {
        closeSettings();
    }
});

// ==================== PLATFORM FUNCTIONS ====================
function updatePlatform() {
    if (keys.a) platform.tilt = Math.max(platform.tilt - platform.tiltSpeed, -platform.maxTilt);
    if (keys.z) platform.tilt = Math.min(platform.tilt + platform.tiltSpeed, platform.maxTilt);
    
    if (keys.n) platform.x = Math.max(platform.x - platform.moveSpeed, platform.minX);
    if (keys.m) platform.x = Math.min(platform.x + platform.moveSpeed, platform.maxX);

    if (!keys.a && !keys.z) {
        platform.tilt *= 0.96;
    }
}

function getPlatformAngle() {
    return Math.atan2(platform.tilt * 2, platform.width);
}

function getPlatformYAtX(x) {
    const centerX = platform.x + platform.width / 2;
    const relativeX = (x - centerX) / (platform.width / 2);
    return platform.y - (platform.tilt * relativeX);
}

// ==================== BALL FUNCTIONS ====================
function updateBall() {
    const angle = getPlatformAngle();
    
    // Reduce gravity effect when magnet is active (ball sticks better)
    const effectiveGravity = magnetActive ? gravity * 0.7 : gravity;
    
    ball.ax = -Math.sin(angle) * effectiveGravity;
    ball.ay = effectiveGravity;

    const platformY = getPlatformYAtX(ball.x);
    const distanceFromPlatform = ball.y + ball.radius - platformY;

    if (ball.x >= platform.x && ball.x <= platform.x + platform.width) {
        if (distanceFromPlatform >= 0 && ball.vy >= 0) {
            ball.y = platformY - ball.radius;
            ball.vx += ball.ax;
            
            // Use higher friction when magnet is active
            const currentRollFriction = magnetActive ? magnetRollFriction : rollFriction;
            ball.vx *= currentRollFriction;
            
            if (ball.vy > 1) {
                // Reduce bounce when magnet is active (90% less)
                const currentBounceFactor = magnetActive ? bounceFactor * 0.1 : bounceFactor;
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

    ball.vx *= friction;
    ball.x += ball.vx;
    ball.y += ball.vy;

    trail.push({ x: ball.x, y: ball.y });
    if (trail.length > maxTrailLength) {
        trail.shift();
    }

    if (ball.y > canvas.height + ball.radius || 
        ball.x < -ball.radius || 
        ball.x > canvas.width + ball.radius) {
        finalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        gameOver('The ball fell off the platform!');
    }
}

// ==================== BLACK HOLE FUNCTIONS ====================
function spawnBlackHole() {
    const holeRadius = ball.radius * 2;
    const x = holeRadius + Math.random() * (canvas.width - holeRadius * 2);
    blackHoles.push({
        x: x,
        y: -holeRadius,
        radius: holeRadius,
        rotation: Math.random() * Math.PI * 2
    });
}

function updateBlackHoles() {
    spawnTimer++;
    if (spawnTimer >= spawnInterval) {
        spawnBlackHole();
        spawnTimer = 0;
    }

    for (let i = blackHoles.length - 1; i >= 0; i--) {
        blackHoles[i].y += scrollSpeed;
        blackHoles[i].rotation += 0.03;

        if (blackHoles[i].y > canvas.height + blackHoles[i].radius) {
            blackHoles.splice(i, 1);
        }
    }
}

function checkBlackHoleCollision() {
    if (shieldActive) return null;
    
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

function applyBlackHoleGravity() {
    if (shieldActive) return;
    
    for (const hole of blackHoles) {
        const dx = hole.x - ball.x;
        const dy = hole.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < blackHoleGravityRadius && distance > 0) {
            let strength = blackHoleGravityStrength * (1 - distance / blackHoleGravityRadius) * (1 - distance / blackHoleGravityRadius);
            
            // Reduce black hole gravity by 90% when magnet is active
            if (magnetActive) {
                strength *= 0.1;
            }
            
            const nx = dx / distance;
            const ny = dy / distance;
            
            ball.vx += nx * strength;
            ball.vy += ny * strength;
        }
    }
}

function startSuckingAnimation(hole) {
    beingSucked = true;
    suckingHole = hole;
    suckProgress = 0;
    suckStartPos = { x: ball.x, y: ball.y };
    suckStartRadius = ball.radius;
    suckParticles = [];
    finalTime = ((Date.now() - startTime) / 1000).toFixed(1);
}

function updateSuckingAnimation() {
    if (!beingSucked) return false;
    
    suckProgress += 0.03;
    
    ball.x += (suckingHole.x - ball.x) * 0.1;
    ball.y += (suckingHole.y - ball.y) * 0.1;
    
    ball.radius = suckStartRadius * (1 - suckProgress * 0.9);
    ball.suckRotation = (ball.suckRotation || 0) + 0.3 * (1 + suckProgress * 3);
    
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
    
    if (suckProgress >= 1) {
        ball.radius = suckStartRadius;
        return true;
    }
    return false;
}

// ==================== POWER-UP FUNCTIONS ====================
function spawnPowerUp() {
    const enabledTypes = [];
    if (settings.powerUpShield) enabledTypes.push('shield');
    if (settings.powerUpWidePlatform) enabledTypes.push('widePlatform');
    if (settings.powerUpMagnet) enabledTypes.push('magnet');
    if (settings.powerUpShrinkBall) enabledTypes.push('shrinkBall');
    
    if (enabledTypes.length === 0) return;
    
    const type = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];
    const radius = 15;
    const x = radius + Math.random() * (canvas.width - radius * 2);
    
    powerUps.push({
        type: type,
        x: x,
        y: -radius,
        radius: radius,
        rotation: 0
    });
}

function updatePowerUps() {
    powerUpSpawnTimer++;
    if (powerUpSpawnTimer >= powerUpSpawnInterval) {
        spawnPowerUp();
        powerUpSpawnTimer = 0;
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].y += scrollSpeed;
        powerUps[i].rotation += 0.03;

        if (powerUps[i].y > canvas.height + powerUps[i].radius) {
            powerUps.splice(i, 1);
        }
    }

    if (shieldActive && Date.now() > shieldEndTime) {
        shieldActive = false;
    }

    if (widePlatformActive && Date.now() > widePlatformEndTime) {
        widePlatformActive = false;
        // Restore normal platform width
        applyPlatformWidth();
    }

    if (magnetActive && Date.now() > magnetEndTime) {
        magnetActive = false;
    }

    if (shrinkBallActive && Date.now() > shrinkBallEndTime) {
        shrinkBallActive = false;
        // Restore normal ball size
        ball.radius = baseBallRadius;
    }
}

function checkPowerUpCollision() {
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

function activatePowerUp(type) {
    switch (type) {
        case 'shield':
            shieldActive = true;
            shieldEndTime = Date.now() + shieldDuration;
            break;
        case 'widePlatform':
            widePlatformActive = true;
            widePlatformEndTime = Date.now() + widePlatformDuration;
            // Apply 30% wider platform
            applyPlatformWidth();
            break;
        case 'magnet':
            magnetActive = true;
            magnetEndTime = Date.now() + magnetDuration;
            break;
        case 'shrinkBall':
            shrinkBallActive = true;
            shrinkBallEndTime = Date.now() + shrinkBallDuration;
            // Shrink ball by 50%
            ball.radius = baseBallRadius * 0.5;
            break;
    }
}

// ==================== DRAWING FUNCTIONS ====================
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0d1b2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(233, 69, 96, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawPlatform() {
    const leftY = platform.y + platform.tilt;
    const rightY = platform.y - platform.tilt;

    ctx.beginPath();
    ctx.moveTo(platform.x, leftY + 20);
    ctx.lineTo(platform.x + platform.width, rightY + 20);
    ctx.lineTo(platform.x + platform.width, rightY + 25);
    ctx.lineTo(platform.x, leftY + 25);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Magnet effect on platform
    if (magnetActive) {
        ctx.shadowColor = '#ff6b35';
        ctx.shadowBlur = 25;
    } else {
        ctx.shadowColor = '#00d9ff';
        ctx.shadowBlur = 20;
    }

    const gradient = ctx.createLinearGradient(platform.x, leftY, platform.x + platform.width, rightY);
    if (magnetActive) {
        gradient.addColorStop(0, '#ff6b35');
        gradient.addColorStop(0.5, '#cc5528');
        gradient.addColorStop(1, '#ff6b35');
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

    ctx.beginPath();
    ctx.moveTo(platform.x, leftY);
    ctx.lineTo(platform.x + platform.width, rightY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawBlackHoles() {
    for (const hole of blackHoles) {
        const gravityGradient = ctx.createRadialGradient(
            hole.x, hole.y, hole.radius,
            hole.x, hole.y, blackHoleGravityRadius
        );
        gravityGradient.addColorStop(0, 'rgba(100, 0, 150, 0.15)');
        gravityGradient.addColorStop(0.5, 'rgba(60, 0, 100, 0.05)');
        gravityGradient.addColorStop(1, 'rgba(40, 0, 80, 0)');
        
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, blackHoleGravityRadius, 0, Math.PI * 2);
        ctx.fillStyle = gravityGradient;
        ctx.fill();
        
        const gradient = ctx.createRadialGradient(
            hole.x, hole.y, 0,
            hole.x, hole.y, hole.radius * 1.5
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(20, 0, 40, 0.8)');
        gradient.addColorStop(0.7, 'rgba(60, 0, 100, 0.4)');
        gradient.addColorStop(1, 'rgba(100, 0, 150, 0)');

        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();

        ctx.save();
        ctx.translate(hole.x, hole.y);
        ctx.rotate(hole.rotation);
        
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, hole.radius * 0.7, i * Math.PI * 2 / 3, i * Math.PI * 2 / 3 + Math.PI / 2);
            ctx.strokeStyle = `rgba(150, 50, 255, ${0.5 - i * 0.15})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        ctx.restore();

        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.radius * 0.3, 0, Math.PI * 2);
        const innerGradient = ctx.createRadialGradient(
            hole.x, hole.y, 0,
            hole.x, hole.y, hole.radius * 0.3
        );
        innerGradient.addColorStop(0, 'rgba(100, 0, 150, 0.5)');
        innerGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        ctx.fillStyle = innerGradient;
        ctx.fill();
    }
}

function drawPowerUps() {
    for (const pu of powerUps) {
        ctx.save();
        ctx.translate(pu.x, pu.y);
        
        if (pu.type !== 'shield') {
            ctx.rotate(pu.rotation);
        }

        if (pu.type === 'shield') {
            const pulse = Math.sin(Date.now() * 0.005) * 0.15 + 1;
            
            // Blue/silver shield colors (like the emoji)
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

            // Shield shape - flat top, pointed bottom
            ctx.beginPath();
            ctx.moveTo(-pu.radius * 0.9, -pu.radius * 0.8);
            ctx.lineTo(pu.radius * 0.9, -pu.radius * 0.8);
            ctx.quadraticCurveTo(pu.radius * 1.1, -pu.radius * 0.6, pu.radius * 1.0, -pu.radius * 0.2);
            ctx.quadraticCurveTo(pu.radius * 0.8, pu.radius * 0.5, 0, pu.radius * 1.1);
            ctx.quadraticCurveTo(-pu.radius * 0.8, pu.radius * 0.5, -pu.radius * 1.0, -pu.radius * 0.2);
            ctx.quadraticCurveTo(-pu.radius * 1.1, -pu.radius * 0.6, -pu.radius * 0.9, -pu.radius * 0.8);
            ctx.closePath();

            // Blue/silver gradient
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

        if (pu.type === 'widePlatform') {
            const pulse = Math.sin(Date.now() * 0.005) * 0.15 + 1;
            
            // Cyan/teal color like the platform
            ctx.shadowColor = '#00d9ff';
            ctx.shadowBlur = 15 * pulse;

            // Outer glow
            const glowGradient = ctx.createRadialGradient(0, 0, pu.radius * 0.5, 0, 0, pu.radius * 1.5 * pulse);
            glowGradient.addColorStop(0, 'rgba(0, 217, 255, 0.4)');
            glowGradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
            ctx.beginPath();
            ctx.arc(0, 0, pu.radius * 1.5 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = glowGradient;
            ctx.fill();

            // Wide platform icon - horizontal bar with arrows
            const barWidth = pu.radius * 1.6;
            const barHeight = pu.radius * 0.4;
            
            // Main bar
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

            // Left arrow
            ctx.beginPath();
            ctx.moveTo(-barWidth/2 - 6, 0);
            ctx.lineTo(-barWidth/2 - 2, -5);
            ctx.lineTo(-barWidth/2 - 2, 5);
            ctx.closePath();
            ctx.fillStyle = '#fff';
            ctx.fill();

            // Right arrow
            ctx.beginPath();
            ctx.moveTo(barWidth/2 + 6, 0);
            ctx.lineTo(barWidth/2 + 2, -5);
            ctx.lineTo(barWidth/2 + 2, 5);
            ctx.closePath();
            ctx.fillStyle = '#fff';
            ctx.fill();

            ctx.shadowBlur = 0;
        }

        if (pu.type === 'magnet') {
            const pulse = Math.sin(Date.now() * 0.005) * 0.15 + 1;
            
            // Orange/red magnet color
            ctx.shadowColor = '#ff6b35';
            ctx.shadowBlur = 15 * pulse;

            // Outer glow
            const glowGradient = ctx.createRadialGradient(0, 0, pu.radius * 0.5, 0, 0, pu.radius * 1.5 * pulse);
            glowGradient.addColorStop(0, 'rgba(255, 107, 53, 0.4)');
            glowGradient.addColorStop(1, 'rgba(255, 107, 53, 0)');
            ctx.beginPath();
            ctx.arc(0, 0, pu.radius * 1.5 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = glowGradient;
            ctx.fill();

            // Horseshoe magnet shape
            const magnetRadius = pu.radius * 0.8;
            const magnetThickness = pu.radius * 0.35;
            
            // Draw the horseshoe (U-shape)
            ctx.beginPath();
            // Outer arc
            ctx.arc(0, 0, magnetRadius, Math.PI, 0, false);
            // Right leg
            ctx.lineTo(magnetRadius, pu.radius * 0.6);
            // Right inner corner
            ctx.lineTo(magnetRadius - magnetThickness, pu.radius * 0.6);
            // Inner arc
            ctx.arc(0, 0, magnetRadius - magnetThickness, 0, Math.PI, true);
            // Left inner corner
            ctx.lineTo(-magnetRadius + magnetThickness, pu.radius * 0.6);
            // Left leg
            ctx.lineTo(-magnetRadius, pu.radius * 0.6);
            ctx.closePath();

            // Orange/red gradient
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

            // Add pole indicators (red and blue tips)
            // Left pole (red)
            ctx.beginPath();
            ctx.rect(-magnetRadius, pu.radius * 0.3, magnetThickness, pu.radius * 0.3);
            ctx.fillStyle = '#cc0000';
            ctx.fill();
            
            // Right pole (blue)
            ctx.beginPath();
            ctx.rect(magnetRadius - magnetThickness, pu.radius * 0.3, magnetThickness, pu.radius * 0.3);
            ctx.fillStyle = '#0066cc';
            ctx.fill();

            ctx.shadowBlur = 0;
        }

        if (pu.type === 'shrinkBall') {
            const pulse = Math.sin(Date.now() * 0.005) * 0.15 + 1;
            
            // Purple/violet color for shrink
            ctx.shadowColor = '#9932ff';
            ctx.shadowBlur = 15 * pulse;

            // Outer glow
            const glowGradient = ctx.createRadialGradient(0, 0, pu.radius * 0.5, 0, 0, pu.radius * 1.5 * pulse);
            glowGradient.addColorStop(0, 'rgba(153, 50, 255, 0.4)');
            glowGradient.addColorStop(1, 'rgba(153, 50, 255, 0)');
            ctx.beginPath();
            ctx.arc(0, 0, pu.radius * 1.5 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = glowGradient;
            ctx.fill();

            // Draw a ball with inward arrows to indicate shrinking
            // Main ball
            const ballRadius = pu.radius * 0.6;
            const ballGradient = ctx.createRadialGradient(
                -ballRadius * 0.3, -ballRadius * 0.3, 0,
                0, 0, ballRadius
            );
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

            // Draw inward arrows
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            const arrowDist = pu.radius * 1.1;
            const arrowSize = 4;
            
            // Four arrows pointing inward
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
                
                // Arrowhead
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

        ctx.restore();
    }
}

function drawTrail() {
    const colorConfig = ballColors[settings.ballColor];
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

function drawSuckParticles() {
    const colorConfig = ballColors[settings.ballColor];
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

function drawShieldEffect() {
    if (!shieldActive) return;

    const remaining = shieldEndTime - Date.now();
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

function drawMagnetEffect() {
    if (!magnetActive) return;

    const remaining = magnetEndTime - Date.now();
    const pulseSpeed = remaining < 2000 ? 0.3 : 0.1;
    const pulse = Math.sin(Date.now() * pulseSpeed) * 0.15 + 0.85;

    ctx.save();

    // Draw magnetic field lines around ball
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

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius * 1.5 * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 107, 53, ${0.3 * pulse})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

function drawBall() {
    const colorConfig = ballColors[settings.ballColor];
    
    if (!beingSucked) {
        ctx.beginPath();
        ctx.ellipse(ball.x + 5, ball.y + ball.radius + 5, ball.radius * 0.8, ball.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
    }

    if (shieldActive && !beingSucked) {
        ctx.shadowColor = '#ffd700';
    } else if (magnetActive && !beingSucked) {
        ctx.shadowColor = '#ff6b35';
    } else {
        ctx.shadowColor = beingSucked ? colorConfig.suckGlow : colorConfig.glow;
    }
    ctx.shadowBlur = beingSucked ? 35 : (shieldActive || magnetActive ? 30 : 25);

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

    ctx.beginPath();
    ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();
    
    ctx.restore();
}

// ==================== UI FUNCTIONS ====================
function updateUI() {
    if (gameRunning && !beingSucked) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        document.getElementById('timeDisplay').textContent = elapsed;
    } else if (finalTime) {
        document.getElementById('timeDisplay').textContent = finalTime;
    }
    document.getElementById('bestDisplay').textContent = bestTime.toFixed(1);
    
    const angleDegrees = (getPlatformAngle() * 180 / Math.PI).toFixed(1);
    document.getElementById('angleDisplay').textContent = angleDegrees + '°';

    const shieldDisplay = document.getElementById('shieldDisplay');
    if (shieldActive) {
        const remaining = Math.max(0, (shieldEndTime - Date.now()) / 1000).toFixed(1);
        shieldDisplay.textContent = remaining + 's';
        shieldDisplay.parentElement.style.display = 'block';
    } else {
        shieldDisplay.parentElement.style.display = 'none';
    }

    const widePlatformDisplay = document.getElementById('widePlatformDisplay');
    if (widePlatformActive) {
        const remaining = Math.max(0, (widePlatformEndTime - Date.now()) / 1000).toFixed(1);
        widePlatformDisplay.textContent = remaining + 's';
        widePlatformDisplay.parentElement.style.display = 'block';
    } else {
        widePlatformDisplay.parentElement.style.display = 'none';
    }

    const magnetDisplay = document.getElementById('magnetDisplay');
    if (magnetActive) {
        const remaining = Math.max(0, (magnetEndTime - Date.now()) / 1000).toFixed(1);
        magnetDisplay.textContent = remaining + 's';
        magnetDisplay.parentElement.style.display = 'block';
    } else {
        magnetDisplay.parentElement.style.display = 'none';
    }

    const shrinkBallDisplay = document.getElementById('shrinkBallDisplay');
    if (shrinkBallActive) {
        const remaining = Math.max(0, (shrinkBallEndTime - Date.now()) / 1000).toFixed(1);
        shrinkBallDisplay.textContent = remaining + 's';
        shrinkBallDisplay.parentElement.style.display = 'block';
    } else {
        shrinkBallDisplay.parentElement.style.display = 'none';
    }
}

// ==================== GAME CONTROL ====================
function gameOver(reason) {
    gameRunning = false;
    gameOverReason = reason || 'The ball fell off the platform!';
    
    if (parseFloat(finalTime) > bestTime) {
        bestTime = parseFloat(finalTime);
        localStorage.setItem('balanceBest', bestTime.toString());
    }

    document.getElementById('finalTime').textContent = finalTime;
    document.getElementById('gameOverReason').textContent = gameOverReason;
    document.getElementById('gameOver').style.display = 'block';
}

function restartGame() {
    applySettings();
    widePlatformActive = false;
    widePlatformEndTime = 0;
    magnetActive = false;
    magnetEndTime = 0;
    shrinkBallActive = false;
    shrinkBallEndTime = 0;
    applyPlatformWidth();
    ball.x = platform.x + platform.width / 2;
    ball.y = 400;
    ball.vx = 0;
    ball.vy = 0;
    ball.radius = baseBallRadius;
    ball.suckRotation = 0;
    platform.tilt = 0;
    trail.length = 0;
    blackHoles.length = 0;
    spawnTimer = 0;
    beingSucked = false;
    suckingHole = null;
    suckProgress = 0;
    suckParticles = [];
    powerUps.length = 0;
    powerUpSpawnTimer = 0;
    shieldActive = false;
    shieldEndTime = 0;
    finalTime = 0;
    startTime = Date.now();
    gameRunning = true;
    document.getElementById('gameOver').style.display = 'none';
}

// ==================== GAME LOOP ====================
function gameLoop() {
    if (gameRunning) {
        if (beingSucked) {
            updateBlackHoles();
            updatePowerUps();
            if (updateSuckingAnimation()) {
                gameOver('The ball was sucked into a black hole!');
            }
        } else {
            updatePlatform();
            updateBall();
            applyBlackHoleGravity();
            updateBlackHoles();
            updatePowerUps();
            checkPowerUpCollision();
            
            const caughtByHole = checkBlackHoleCollision();
            if (caughtByHole) {
                startSuckingAnimation(caughtByHole);
            }
        }
    }

    drawBackground();
    drawBlackHoles();
    drawPowerUps();
    drawSuckParticles();
    drawTrail();
    drawPlatform();
    drawShieldEffect();
    drawMagnetEffect();
    drawBall();
    updateUI();

    requestAnimationFrame(gameLoop);
}

// ==================== INITIALIZATION ====================
document.getElementById('bestDisplay').textContent = bestTime.toFixed(1);
applySettings();
updateSettingsUI();
ball.x = platform.x + platform.width / 2;
gameLoop();
