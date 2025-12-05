// ==================== MAIN ====================
// Game initialization and main loop

import { BALL } from './config.js';
import { state, resetState } from './state.js';
import { 
    updatePlatform, 
    updateBall, 
    updateBlackHoles, 
    applyBlackHoleGravity,
    checkBlackHoleCollision,
    startSuckingAnimation,
    updateSuckingAnimation,
    applyPlatformWidth,
    updateScoreBalls,
    checkScoreBallCollision
} from './entities.js';
import { updatePowerUps, checkPowerUpCollision } from './powerups.js';
import { initRenderer, render } from './renderer.js';
import { initUI, updateUI, showGameOver, hideGameOver, applySettingsToGame, setupGlobalHandlers } from './ui.js';
import { initInput } from './input.js';

// ==================== GAME CONTROL ====================

function restartGame() {
    applySettingsToGame();
    resetState();
    applyPlatformWidth();
    state.ball.x = state.platform.x + state.platform.width / 2;
    state.ball.radius = BALL.BASE_RADIUS;
    hideGameOver();
}

// Make restartGame available globally for HTML button
window.restartGame = restartGame;

// ==================== GAME LOOP ====================

let frameCount = 0;
let lastTime = 0;
const TARGET_FPS = 60;
const TARGET_FRAME_TIME = 1000 / TARGET_FPS;  // ~16.67ms

function gameLoop(currentTime) {
    try {
        // Calculate delta time (clamped to prevent spiral of death on tab switch)
        if (lastTime === 0) lastTime = currentTime;
        const rawDelta = currentTime - lastTime;
        lastTime = currentTime;
        
        // Clamp delta to max 100ms (10 FPS minimum) to handle tab switching
        const clampedDelta = Math.min(rawDelta, 100);
        
        // Delta multiplier: 1.0 at 60 FPS, 0.5 at 120 FPS, 2.0 at 30 FPS
        const dt = clampedDelta / TARGET_FRAME_TIME;
        
        frameCount++;
        
        if (state.gameRunning && !state.gamePaused) {
            if (state.beingSucked) {
                updateBlackHoles(dt);
                updateScoreBalls(dt);
                updatePowerUps(dt);
                if (updateSuckingAnimation(dt)) {
                    showGameOver('The ball was sucked into a black hole!');
                }
            } else {
                updatePlatform(dt);
                const ballResult = updateBall(dt);
                if (ballResult === 'fell') {
                    showGameOver('The ball fell off the platform!');
                }
                
                applyBlackHoleGravity(dt);
                updateBlackHoles(dt);
                updateScoreBalls(dt);
                checkScoreBallCollision();
                updatePowerUps(dt);
                checkPowerUpCollision();
                
                const collision = checkBlackHoleCollision();
                if (collision) {
                    const result = startSuckingAnimation(collision);
                    // Only start game over animation if no backup ball
                    if (result !== 'gameOver') {
                        // Ball was lost but game continues
                    }
                }
            }
        }

        render();
        updateUI();
        
        // Debug: log every 60 frames (roughly every second at 60fps)
        if (frameCount % 60 === 0) {
            console.log('Frame', frameCount, '- Ball:', state.ball.x.toFixed(1), state.ball.y.toFixed(1), 
                       '- Vel:', state.ball.vx.toFixed(2), state.ball.vy.toFixed(2),
                       '- ExtraBall:', state.extraBall ? 'yes' : 'no',
                       '- FPS:', Math.round(1000 / clampedDelta));
        }
    } catch (error) {
        console.error('Game loop error:', error);
        console.error('Stack:', error.stack);
        // Show error visually
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed;top:10px;left:10px;background:red;color:white;padding:20px;z-index:9999;font-family:monospace;max-width:80%;';
        errorDiv.textContent = 'ERROR: ' + error.message + '\n' + error.stack;
        document.body.appendChild(errorDiv);
    }

    requestAnimationFrame(gameLoop);
}

// ==================== INITIALIZATION ====================

function init() {
    try {
        console.log('Balance Ball: Starting initialization...');
        
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('Canvas element not found!');
            return;
        }
        console.log('Balance Ball: Canvas found');
        
        // Initialize modules
        initRenderer(canvas);
        console.log('Balance Ball: Renderer initialized');
        
        initUI();
        console.log('Balance Ball: UI initialized');
        
        initInput(restartGame);
        console.log('Balance Ball: Input initialized');
        
        setupGlobalHandlers();
        console.log('Balance Ball: Global handlers setup');
        
        // Position ball on platform
        state.ball.x = state.platform.x + state.platform.width / 2;
        console.log('Balance Ball: Ball positioned at', state.ball.x, state.ball.y);
        console.log('Balance Ball: Platform at', state.platform.x, state.platform.y);
        console.log('Balance Ball: Game running:', state.gameRunning);
        
        // Start game loop with timestamp
        console.log('Balance Ball: Starting game loop');
        requestAnimationFrame(gameLoop);
        
        console.log('Balance Ball: Initialization complete!');
    } catch (error) {
        console.error('Initialization error:', error);
        console.error('Stack:', error.stack);
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
