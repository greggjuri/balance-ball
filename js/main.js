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
    applyPlatformWidth
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

function gameLoop() {
    if (state.gameRunning) {
        if (state.beingSucked) {
            updateBlackHoles();
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
            updatePowerUps();
            checkPowerUpCollision();
            
            const caughtByHole = checkBlackHoleCollision();
            if (caughtByHole) {
                startSuckingAnimation(caughtByHole);
            }
        }
    }

    render();
    updateUI();

    requestAnimationFrame(gameLoop);
}

// ==================== INITIALIZATION ====================

function init() {
    const canvas = document.getElementById('gameCanvas');
    
    // Initialize modules
    initRenderer(canvas);
    initUI();
    initInput(restartGame);
    setupGlobalHandlers();
    
    // Position ball on platform
    state.ball.x = state.platform.x + state.platform.width / 2;
    
    // Start game loop
    gameLoop();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
