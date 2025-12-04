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

function gameLoop() {
    try {
        frameCount++;
        
        if (state.gameRunning) {
            if (state.beingSucked) {
                updateBlackHoles();
                updateScoreBalls();
                updatePowerUps();
                if (updateSuckingAnimation()) {
                    showGameOver('The ball was sucked into a black hole!');
                }
            } else {
                updatePlatform();
                const ballResult = updateBall();
                if (ballResult === 'fell') {
                    showGameOver('The ball fell off the platform!');
                }
                
                applyBlackHoleGravity();
                updateBlackHoles();
                updateScoreBalls();
                checkScoreBallCollision();
                updatePowerUps();
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
        
        // Debug: log every 60 frames (roughly every second)
        if (frameCount % 60 === 0) {
            console.log('Frame', frameCount, '- Ball:', state.ball.x.toFixed(1), state.ball.y.toFixed(1), 
                       '- Vel:', state.ball.vx.toFixed(2), state.ball.vy.toFixed(2),
                       '- ExtraBall:', state.extraBall ? 'yes' : 'no');
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
        
        // Start game loop
        console.log('Balance Ball: Starting game loop');
        gameLoop();
        
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
