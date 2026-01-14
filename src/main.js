// CODEBREAKOUT - Main Game Module
// ============================================================================
// Main CodeBreakout class and game loop
// ============================================================================

// Configuration and data
import { CONFIG } from './config.js';
import { LEVELS } from './levels.js';
import { POWERUP_TYPES } from './powerups.js';
import { BRICK_TYPES } from './brickTypes.js';

// State
import { GameState } from './state.js';

// Entities
import { createPaddle, updatePaddle, setPaddleWidthMultiplier, resetPaddleWidth, enableMagnet, useMagnetCatch, enableInvertedControls, disableInvertedControls, enableSplitPaddle, disableSplitPaddle } from './entities/paddle.js';
import { createBallOnPaddle, launchBall, updateBallPosition, checkWallCollision, isBallOutOfBounds, bounceOffShield, updateBallVelocity, setBallSpeedMultiplier, resetBallSpeed, createMultiBalls, syncBallWithPaddle, enableFireball, disableFireball, enableDoodleMode, applyDoodleGravity, applyDoodleJump } from './entities/ball.js';
import { createBricks, updateMovingBricks, hitBrick, findAdjacentBricks, getBrickCenter } from './entities/brick.js';
import { spawnPositivePowerup, spawnNegativePowerup, updatePowerups as updatePowerupEntities, fireLasers, updateLaserPosition, isLaserOffScreen, checkLaserBrickCollision } from './entities/powerup.js';

// Systems
import { createInputManager } from './systems/input.js';
import { checkPaddleCollision, checkBrickCollisions } from './systems/collision.js';
import { render, updatePowerupIndicators } from './systems/render.js';
import { createAudioManager } from './systems/audio.js';
import { loadHighScores, addHighScore, updateHighScoreDisplay, displayLeaderboard } from './systems/storage.js';

// Easter eggs
import { getComboTier, getStreakQuote, checkSpecialAttack, createQuoteElement, createSpecialAttackElement } from './easterEggs.js';

/**
 * Main game class
 */
class CodeBreakout {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = new GameState();

        // Entities
        this.paddle = null;
        this.balls = [];
        this.bricks = [];
        this.powerups = [];
        this.lasers = [];
        this.particles = [];
        this.floatingTexts = [];
        this.ballTrail = [];
        this.shield = null;
        this.portalPairs = [];

        // Systems
        this.input = createInputManager();
        this.audio = createAudioManager();
        this.highScores = [];

        // Animation
        this.lastTime = 0;
        this.animationId = null;
        this.scale = 1;

        // Laser click state
        this.fireLaserOnClick = false;

        // Screen shake for explosions
        this.screenShake = { intensity: 0, duration: 0 };

        // Streak quotes
        this.lastQuoteTime = 0;
        this.lastQuoteTier = null;

        // Bonus-only mode
        this.bonusOnlyMode = false;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.input.init(this.canvas, this.scale);
        this.setupEventListeners();
        this.loadHighScore();
        this.showScreen('start');
    }

    /**
     * Check and show streak quote when multiplier reaches certain tiers
     */
    checkStreakQuote() {
        const now = Date.now();
        // Cooldown: 8 seconds between quotes
        if (now - this.lastQuoteTime < 8000) return;

        // Don't show quotes when level is about to complete
        const levelData = LEVELS[this.state.level];
        if (levelData.bonus) {
            // Bonus levels: don't show in last 3 seconds
            if (this.state.bonusEndTime - now < 3000) return;
        } else {
            // Normal levels: don't show when no breakable bricks left
            const remaining = this.bricks.filter(b => b.type !== 'UNBREAKABLE' && !b.destroyed).length;
            if (remaining === 0) return;
        }

        const tier = getComboTier(this.state.multiplier);
        if (!tier) return;

        // Only show quote when reaching a NEW tier (not same tier again)
        if (tier === this.lastQuoteTier) return;

        // Check for special attack first (very rare, EPIC only)
        const specialAttack = checkSpecialAttack(tier);
        if (specialAttack) {
            this.triggerSpecialAttack(specialAttack.type, specialAttack.attack);
            this.lastQuoteTime = now;
            this.lastQuoteTier = tier;
            return;
        }

        // Random chance to show quote (higher chance for higher tiers)
        const chances = { LOW: 0.3, MEDIUM: 0.5, HIGH: 0.7, EPIC: 0.9 };
        if (Math.random() > chances[tier]) return;

        const quoteData = getStreakQuote(tier);
        if (quoteData) {
            this.showStreakQuote(quoteData.text, quoteData.char, tier);
            this.lastQuoteTime = now;
            this.lastQuoteTier = tier;
        }
    }

    showStreakQuote(text, char, tier) {
        const quote = createQuoteElement(text, char, tier);
        document.body.appendChild(quote);
        setTimeout(() => quote.remove(), 2500);

        // Screen flash for HIGH and EPIC tiers
        if (tier === 'HIGH' || tier === 'EPIC') {
            document.body.classList.add('streak-flash');
            setTimeout(() => document.body.classList.remove('streak-flash'), 300);
        }
    }

    triggerSpecialAttack(type, attack) {
        if (this.state.screen !== 'game' || this.balls.length === 0) return;

        this.audio.playSound('laser');

        // Show special attack quote
        const quoteEl = createSpecialAttackElement(type, attack);
        document.body.appendChild(quoteEl);
        setTimeout(() => quoteEl.remove(), 2500);

        // Get ball position for targeting
        const ball = this.balls[0];

        if (type === 'KAMEHAMEHA') {
            // Destroy column - vertical beam from paddle
            this.triggerKamehameha(ball.x, attack.color);
        } else if (type === 'HADOUKEN') {
            // Destroy row - horizontal wave at ball height
            this.triggerHadouken(ball.y, attack.color);
        }

        // Screen shake
        this.triggerScreenShake(10, 400);
    }

    triggerKamehameha(targetX, color) {
        // Get canvas position relative to its parent
        const canvasRect = this.canvas.getBoundingClientRect();
        const parentRect = this.canvas.parentElement.getBoundingClientRect();
        const canvasOffsetX = canvasRect.left - parentRect.left;

        // Create vertical beam effect
        const beam = document.createElement('div');
        beam.className = 'kamehameha-beam';
        beam.style.setProperty('--beam-color', color);
        beam.style.left = `${canvasOffsetX + targetX * this.scale}px`;
        beam.style.top = `${canvasRect.top - parentRect.top}px`;
        beam.style.height = `${canvasRect.height}px`;
        this.canvas.parentElement.appendChild(beam);
        setTimeout(() => beam.remove(), 800);

        // Destroy bricks in column (tolerance of 40px)
        for (let i = this.bricks.length - 1; i >= 0; i--) {
            const brick = this.bricks[i];
            // Skip destroyed bricks (for bonus level regeneration)
            if (brick.destroyed) continue;
            const brickCenterX = brick.x + brick.width / 2;
            if (Math.abs(brickCenterX - targetX) < 40 && brick.type !== 'UNBREAKABLE') {
                brick.hits = brick.maxHits; // Force destroy
                this.destroyBrick(brick, i);
            }
        }
    }

    triggerHadouken(targetY, color) {
        // Get canvas position relative to its parent
        const canvasRect = this.canvas.getBoundingClientRect();
        const parentRect = this.canvas.parentElement.getBoundingClientRect();
        const canvasOffsetY = canvasRect.top - parentRect.top;
        const canvasOffsetX = canvasRect.left - parentRect.left;

        // Create horizontal wave effect
        const wave = document.createElement('div');
        wave.className = 'hadouken-wave';
        wave.style.setProperty('--wave-color', color);
        wave.style.top = `${canvasOffsetY + targetY * this.scale}px`;
        wave.style.left = `${canvasOffsetX}px`;
        wave.style.width = `${canvasRect.width}px`;
        this.canvas.parentElement.appendChild(wave);
        setTimeout(() => wave.remove(), 800);

        // Destroy bricks in row (tolerance of 20px)
        for (let i = this.bricks.length - 1; i >= 0; i--) {
            const brick = this.bricks[i];
            // Skip destroyed bricks (for bonus level regeneration)
            if (brick.destroyed) continue;
            const brickCenterY = brick.y + brick.height / 2;
            if (Math.abs(brickCenterY - targetY) < 20 && brick.type !== 'UNBREAKABLE') {
                brick.hits = brick.maxHits; // Force destroy
                this.destroyBrick(brick, i);
            }
        }
    }

    setupCanvas() {
        const maxWidth = Math.min(window.innerWidth, CONFIG.CANVAS_WIDTH);
        const maxHeight = Math.min(window.innerHeight - 100, CONFIG.CANVAS_HEIGHT);
        this.scale = Math.min(maxWidth / CONFIG.CANVAS_WIDTH, maxHeight / CONFIG.CANVAS_HEIGHT);

        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        this.canvas.style.width = `${CONFIG.CANVAS_WIDTH * this.scale}px`;
        this.canvas.style.height = `${CONFIG.CANVAS_HEIGHT * this.scale}px`;

        this.input.updateScale(this.scale);
    }

    setupEventListeners() {
        // Canvas click for launch
        this.canvas.addEventListener('click', () => this.handleClick());

        // Buttons
        document.getElementById('play-btn').addEventListener('click', () => this.startGame());
        document.getElementById('highscores-btn').addEventListener('click', () => this.showHighScores());
        document.getElementById('highscores-back-btn').addEventListener('click', () => this.showScreen('start'));
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('quit-btn').addEventListener('click', () => this.quitToMenu());
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());
        document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
        document.getElementById('submit-score-btn').addEventListener('click', () => this.submitScore());
        document.getElementById('sound-toggle').addEventListener('click', () => this.toggleSound());

        // Bonus mode buttons
        document.getElementById('bonus-mode-btn').addEventListener('click', () => this.showBonusSelect());
        document.getElementById('bonus-back-btn').addEventListener('click', () => this.showScreen('start'));
        document.getElementById('bonus-roguelike-btn').addEventListener('click', () => this.startBonusLevel('roguelike'));
        document.getElementById('bonus-zen-btn').addEventListener('click', () => this.startBonusLevel('relax'));
        document.getElementById('bonus-bounce-btn').addEventListener('click', () => this.startBonusLevel('doodle'));

        // Resize
        window.addEventListener('resize', () => this.setupCanvas());
    }

    handleClick() {
        if (this.state.screen === 'game' && !this.state.isLaunched) {
            this.launchBallAction();
        }
        // Fire laser on click if LASER powerup is active
        if (this.state.isPowerupActive('LASER')) {
            this.fireLaserOnClick = true;
        }
    }

    // ========================================================================
    // SCREEN MANAGEMENT
    // ========================================================================
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById(`${screenName}-screen`).classList.remove('hidden');
        this.state.screen = screenName;

        if (screenName === 'game') {
            document.getElementById('launch-hint').classList.remove('hidden');
        }
    }

    // ========================================================================
    // GAME FLOW
    // ========================================================================
    startGame() {
        this.state.reset();
        this.state.level = 0;
        this.bonusOnlyMode = false;

        // Reset the submit score button for the new game
        const submitBtn = document.getElementById('submit-score-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'SAVE SCORE';
        }

        this.showLevelIntro();
    }

    showBonusSelect() {
        this.showScreen('bonus-select');
    }

    playAgain() {
        if (this.bonusOnlyMode) {
            this.showBonusSelect();
        } else {
            this.startGame();
        }
    }

    startBonusLevel(bonusType) {
        this.state.reset();
        this.bonusOnlyMode = true;

        // Find the level index for this bonus type
        const levelIndex = LEVELS.findIndex(l => l.bonus && l.bonus.type === bonusType);
        if (levelIndex === -1) return;

        this.state.level = levelIndex;

        // Reset the submit score button
        const submitBtn = document.getElementById('submit-score-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'SAVE SCORE';
        }

        this.showLevelIntro();
    }

    showLevelIntro() {
        const levelData = LEVELS[this.state.level];

        // Update intro screen content
        document.getElementById('intro-level-number').textContent = `LEVEL ${this.state.level + 1}`;
        document.getElementById('intro-level-name').textContent = levelData.name;
        document.getElementById('intro-level-name').style.color = levelData.color;
        document.getElementById('intro-level-desc').textContent = levelData.description;

        this.showScreen('level-intro');

        // Auto-hide after 1.5 seconds and start level
        setTimeout(() => {
            this.showScreen('game');
            this.initLevel();
            if (!this.animationId) {
                this.gameLoop(0);
            }
        }, 1500);
    }

    initLevel() {
        const levelData = LEVELS[this.state.level];

        // Reset level state
        this.state.isLaunched = false;
        this.state.perfectLevel = true;
        this.state.levelStartTime = Date.now();
        this.state.bricksDestroyed = 0;
        this.powerups = [];
        this.lasers = [];
        this.particles = [];
        this.floatingTexts = [];
        this.ballTrail = [];
        this.shield = null;
        this.state.activePowerups = {};
        this.state.destroyedBricks = [];

        // Check if bonus level
        const isBonus = levelData.bonus !== undefined;
        this.state.bonusActive = isBonus;

        // Create paddle
        this.paddle = createPaddle(levelData.paddleWidth);

        // Create ball(s)
        if (isBonus && levelData.bonus.initialBalls > 1) {
            // Multiple balls for relax mode
            this.balls = [];
            for (let i = 0; i < levelData.bonus.initialBalls; i++) {
                const ball = createBallOnPaddle(this.paddle, levelData.ballSpeed);
                ball.stuckOffset = (i - levelData.bonus.initialBalls / 2) * 15;
                this.balls.push(ball);
            }
        } else {
            this.balls = [createBallOnPaddle(this.paddle, levelData.ballSpeed)];
        }

        // Create bricks
        const { bricks, portalPairs, totalBreakable } = createBricks(levelData);
        this.bricks = bricks;
        this.portalPairs = portalPairs;
        this.state.totalBricks = totalBreakable;

        // Bonus level setup
        const timerEl = document.querySelector('.bonus-timer');
        const timerSep = document.querySelector('.bonus-timer-sep');

        if (isBonus) {
            this.state.bonusEndTime = Date.now() + levelData.bonus.duration;

            // Show timer
            timerEl.classList.remove('hidden');
            timerSep.classList.remove('hidden');

            // Permanent shield for relax mode
            if (levelData.bonus.permanentShield) {
                this.shield = { permanent: true };
            }

            // Doodle jump mode
            if (levelData.bonus.type === 'doodle') {
                for (const ball of this.balls) {
                    enableDoodleMode(ball, levelData.bonus.gravity, levelData.bonus.jumpForce);
                }
            }
        } else {
            this.state.bonusEndTime = 0;
            timerEl.classList.add('hidden');
            timerSep.classList.add('hidden');
        }

        // Update UI
        this.updateUI();
        document.getElementById('level-name').textContent = levelData.name;
        document.getElementById('level-name').style.color = levelData.color;
        document.getElementById('launch-hint').classList.remove('hidden');
    }

    launchBallAction() {
        // Find all stuck balls
        const stuckBalls = this.balls.filter(ball => ball.stuck);

        // If no stuck balls, nothing to launch
        if (stuckBalls.length === 0) return;

        // Launch all stuck balls
        for (const ball of stuckBalls) {
            // Doodle mode: special launch with small horizontal movement
            if (ball.doodleMode) {
                ball.stuck = false;
                ball.dx = (Math.random() - 0.5) * 3;  // Small random horizontal
                ball.dy = ball.jumpForce;  // Initial jump up
            } else {
                launchBall(ball);

                // Handle magnet release for each ball
                if (this.paddle.hasMagnet && this.paddle.magnetCatches > 0) {
                    useMagnetCatch(this.paddle);
                }
            }
        }

        this.state.isLaunched = true;
        document.getElementById('launch-hint').classList.add('hidden');
    }

    togglePause() {
        if (this.state.screen !== 'game') return;

        this.state.isPaused = !this.state.isPaused;

        if (this.state.isPaused) {
            this.showScreen('pause');
        } else {
            this.showScreen('game');
        }
    }

    quitToMenu() {
        this.state.isPaused = false;
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
        this.showScreen('start');
    }

    nextLevel() {
        this.state.level++;

        if (this.state.level >= LEVELS.length) {
            // Game complete!
            this.gameOver(true);
            return;
        }

        this.showLevelIntro();
    }

    loseLife() {
        const levelData = LEVELS[this.state.level];

        // Bonus levels: no death penalty
        if (levelData.bonus && levelData.bonus.noDeathPenalty) {
            this.spawnFloatingText(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, 'BONUS OVER!', levelData.color);
            // Bonus-only mode: go to game over
            if (this.bonusOnlyMode) {
                this.gameOver(true);
            } else {
                this.nextLevel();
            }
            return;
        }

        const gameOver = this.state.loseLife();
        this.updateUI();

        if (gameOver) {
            this.gameOver(false);
            return;
        }

        // Reset ball
        this.balls = [createBallOnPaddle(this.paddle, LEVELS[this.state.level].ballSpeed)];

        this.state.isLaunched = false;
        document.getElementById('launch-hint').classList.remove('hidden');

        // Clear shield
        this.shield = null;

        // Reset streak quote tier
        this.lastQuoteTier = null;
    }

    levelComplete() {
        const timeMs = Date.now() - this.state.levelStartTime;
        const timeBonus = Math.max(0, 60000 - timeMs) / 100;
        const perfectBonus = this.state.perfectLevel ? 5000 : 0;

        this.state.score += Math.floor(timeBonus + perfectBonus);

        // Bonus-only mode: go directly to game over after bonus level
        if (this.bonusOnlyMode) {
            this.gameOver(true);
            return;
        }

        // Update stats
        document.getElementById('stat-time').textContent = this.formatTime(timeMs);
        document.getElementById('stat-bricks').textContent = this.state.bricksDestroyed;
        document.getElementById('stat-combo').textContent = `x${this.state.maxMultiplier.toFixed(2)}`;
        document.getElementById('stat-score').textContent = Math.floor(timeBonus + perfectBonus);

        // Next level preview
        if (this.state.level + 1 < LEVELS.length) {
            document.getElementById('next-level-name').textContent = `Next: ${LEVELS[this.state.level + 1].name}`;
        } else {
            document.getElementById('next-level-name').textContent = 'Final Level Complete!';
        }

        this.showScreen('level-complete');
    }

    async gameOver(victory) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;

        // Update final score display
        document.getElementById('final-score').textContent = this.state.score.toLocaleString();
        document.getElementById('reached-level').textContent = LEVELS[this.state.level].name;

        // Update game over title based on victory
        const gameOverTitle = document.querySelector('#game-over-screen h2');
        if (gameOverTitle) {
            if (this.bonusOnlyMode) {
                gameOverTitle.textContent = 'BONUS COMPLETE!';
                gameOverTitle.style.color = LEVELS[this.state.level].color;
            } else {
                gameOverTitle.textContent = victory ? 'VICTORY!' : 'GAME OVER';
                gameOverTitle.style.color = victory ? '#00ff88' : '#ff4455';
            }
        }

        // Update play again button text
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.textContent = this.bonusOnlyMode ? 'BACK TO BONUS' : 'PLAY AGAIN';
        }

        // Update leaderboard title to show which mode
        const leaderboardTitle = document.querySelector('#leaderboard-preview h3');
        if (leaderboardTitle) {
            const mode = this.getCurrentScoreMode();
            const modeNames = {
                campaign: 'TOP SCORES',
                roguelike: 'ROGUELIKE BEST',
                relax: 'ZEN MODE BEST',
                doodle: 'BOUNCE BEST',
            };
            leaderboardTitle.textContent = modeNames[mode] || 'TOP SCORES';
        }

        // Load high scores for the current mode
        const mode = this.getCurrentScoreMode();
        this.highScores = await loadHighScores(mode);

        // Display high scores (score will be saved when user clicks "SAVE SCORE")
        displayLeaderboard(
            document.getElementById('leaderboard-list'),
            this.highScores,
            null
        );

        this.showScreen('game-over');
    }

    // ========================================================================
    // GAME LOOP
    // ========================================================================
    gameLoop(timestamp) {
        this.lastTime = timestamp;

        // Handle keyboard input for launch and pause
        if (this.state.screen === 'game') {
            if (this.input.isSpacePressed() && !this.state.isLaunched) {
                this.launchBallAction();
            }
            if (this.input.isEscapePressed()) {
                this.input.clearKey('Escape');
                this.togglePause();
            }
        }

        if (!this.state.isPaused && this.state.screen === 'game') {
            this.update();
            this.render();
        }

        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    update() {
        this.updatePaddleEntity();
        this.updateBalls();
        this.updatePowerupsEntity();
        this.updateLasersEntity();
        updateMovingBricks(this.bricks);
        this.updateParticles();
        this.updateFloatingTexts();
        this.updateBallTrail();
        this.updatePowerupTimers();
        this.updateScreenShake();
        this.updateBonusLevel();
        this.checkExtraLife();
        this.checkLevelComplete();
    }

    updateBonusLevel() {
        const levelData = LEVELS[this.state.level];
        if (!levelData.bonus) return;

        const now = Date.now();

        // Update countdown timer
        const remaining = Math.max(0, this.state.bonusEndTime - now);
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        const timerEl = document.getElementById('bonus-countdown');
        timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Low time warning
        const timerContainer = document.querySelector('.bonus-timer');
        if (remaining < 30000) {
            timerContainer.classList.add('low-time');
        } else {
            timerContainer.classList.remove('low-time');
        }

        // Brick regeneration
        if (levelData.bonus.brickRegenDelay && this.state.destroyedBricks.length > 0) {
            const bricksToRegen = [];
            for (let i = this.state.destroyedBricks.length - 1; i >= 0; i--) {
                const entry = this.state.destroyedBricks[i];
                if (now - entry.time >= levelData.bonus.brickRegenDelay) {
                    bricksToRegen.push(entry);
                    this.state.destroyedBricks.splice(i, 1);
                }
            }

            // Regenerate bricks
            for (const entry of bricksToRegen) {
                entry.brick.hits = 0;  // Reset hits to 0 (fresh brick)
                entry.brick.destroyed = false;
            }
        }

        // Restore permanent shield if lost
        if (levelData.bonus.permanentShield && !this.shield) {
            this.shield = { permanent: true };
        }
    }

    checkExtraLife() {
        if (this.state.checkExtraLife()) {
            this.audio.playSound('powerup');
            this.showOneUp();
            this.updateUI();
        }
    }

    showOneUp() {
        const oneUp = document.createElement('div');
        oneUp.className = 'one-up-effect';
        oneUp.textContent = '1UP!';
        document.getElementById('game-container').appendChild(oneUp);
        setTimeout(() => oneUp.remove(), 1500);
    }

    updatePaddleEntity() {
        updatePaddle(this.paddle, this.input.keys, this.input.mouseX, this.input.touchX);

        // Update stuck ball position
        for (const ball of this.balls) {
            syncBallWithPaddle(ball, this.paddle);
        }
    }

    updateBalls() {
        const activeBalls = [];

        for (const ball of this.balls) {
            if (ball.stuck) {
                activeBalls.push(ball);
                continue;
            }

            // Apply doodle mode gravity and horizontal control
            if (ball.doodleMode) {
                applyDoodleGravity(ball);
                // Ball follows paddle position horizontally (player control)
                const paddleCenter = this.paddle.x + this.paddle.width / 2;
                const ballToTarget = paddleCenter - ball.x;
                ball.dx = ballToTarget * 0.1;  // Smooth follow
                ball.dx = Math.max(-6, Math.min(6, ball.dx));  // Cap horizontal speed
            }

            // Move ball
            updateBallPosition(ball);

            // Wall collisions
            const wallHit = checkWallCollision(ball);
            if (wallHit) {
                this.audio.playSound('wall');
            }

            // Paddle collision (main paddle)
            // Save dx for doodle mode (collision function modifies velocity)
            const savedDx = ball.doodleMode ? ball.dx : 0;
            if (checkPaddleCollision(ball, this.paddle)) {
                // Doodle mode: apply jump force, preserve horizontal movement
                if (ball.doodleMode) {
                    ball.dx = savedDx;  // Restore horizontal velocity
                    applyDoodleJump(ball);
                }
                // Magnet catch (not in doodle mode)
                else if (this.paddle.hasMagnet && this.paddle.magnetCatches > 0) {
                    // Calculate offset from paddle center where ball hit
                    const paddleCenter = this.paddle.x + this.paddle.width / 2;
                    ball.stuckOffset = ball.x - paddleCenter;
                    ball.stuck = true;
                    ball.dx = 0;
                    ball.dy = 0;
                    ball.y = this.paddle.y - ball.radius - 2;
                    this.state.isLaunched = false;
                    document.getElementById('launch-hint').classList.remove('hidden');
                }
                this.audio.playSound('paddle');
            }

            // Split paddle collision (second paddle)
            if (this.paddle.isSplit && this.paddle.splitPaddle) {
                const savedDx2 = ball.doodleMode ? ball.dx : 0;
                if (checkPaddleCollision(ball, this.paddle.splitPaddle)) {
                    if (ball.doodleMode) {
                        ball.dx = savedDx2;
                        applyDoodleJump(ball);
                    }
                    this.audio.playSound('paddle');
                }
            }

            // Brick collisions
            const brickHit = checkBrickCollisions(ball, this.bricks);
            if (brickHit) {
                // Doodle mode: bounce up when landing on brick from above
                if (ball.doodleMode && ball.dy > 0) {
                    // Preserve horizontal velocity
                    const savedBrickDx = ball.dx;
                    applyDoodleJump(ball);
                    ball.dx = savedBrickDx;
                }
                this.handleBrickHit(brickHit.brick, brickHit.index);
                this.audio.playSound('brick');
            }

            // Bottom - lose ball
            if (isBallOutOfBounds(ball)) {
                if (this.shield) {
                    // Shield saves the ball
                    bounceOffShield(ball);
                    // Don't consume permanent shield
                    if (!this.shield.permanent) {
                        this.shield = null;
                    }
                    this.audio.playSound('shield');
                } else {
                    continue; // Ball lost
                }
            }

            activeBalls.push(ball);
        }

        this.balls = activeBalls;

        // Check if all balls lost
        if (this.balls.length === 0) {
            this.loseLife();
        }
    }

    handleBrickHit(brick, index) {
        const destroyed = hitBrick(brick);

        if (destroyed) {
            this.destroyBrick(brick, index);
        } else {
            // Crack effect
            const center = getBrickCenter(brick);
            this.spawnParticles(center.x, center.y, brick.color, 3);
        }
    }

    destroyBrick(brick, index) {
        // Score
        const points = BRICK_TYPES[brick.type].points * this.state.multiplier;
        this.state.score += Math.floor(points);

        // Multiplier
        this.state.incrementMultiplier();
        this.checkStreakQuote();

        this.state.bricksDestroyed++;

        // Particles
        const center = getBrickCenter(brick);
        this.spawnParticles(center.x, center.y, brick.color, 8);

        // Floating score text
        this.spawnFloatingText(center.x, center.y, `+${Math.floor(points)}`, brick.color);

        // Powerup drop with level-based rarity
        const levelData = LEVELS[this.state.level];
        if (Math.random() < levelData.powerupChance) {
            const rarityModifier = levelData.powerupRarity || 1.0;
            this.powerups.push(spawnPositivePowerup(center.x, center.y, rarityModifier));
        }

        // Handle special brick types
        if (brick.type === 'EXPLODING') {
            this.explodeBrick(brick);
        }

        if (brick.type === 'HAZARD') {
            this.powerups.push(spawnNegativePowerup(center.x, center.y));
        }

        // Bonus level: track for regeneration instead of removing
        if (levelData.bonus && levelData.bonus.brickRegenDelay) {
            brick.destroyed = true;
            this.state.destroyedBricks.push({
                brick,
                originalHits: BRICK_TYPES[brick.type].hits,
                time: Date.now(),
            });
        } else {
            // Normal level: remove brick
            this.bricks.splice(index, 1);
        }

        this.updateUI();
    }

    explodeBrick(brick, isChainReaction = false) {
        // Screen shake for explosion (only for initial explosion, not chain)
        if (!isChainReaction) {
            this.triggerScreenShake(8, 300);
        }

        // Extra explosion particles
        const center = getBrickCenter(brick);
        this.spawnParticles(center.x, center.y, '#ff6600', 15);

        // Find and destroy adjacent bricks
        const adjacent = findAdjacentBricks(brick, this.bricks);

        for (const adj of adjacent) {
            const idx = this.bricks.indexOf(adj);
            if (idx >= 0 && adj.type !== 'UNBREAKABLE') {
                // Mark as chain reaction to prevent infinite recursion
                const wasExploding = adj.type === 'EXPLODING';
                adj.hits = adj.maxHits; // Force destroy

                // Temporarily change type to prevent recursive explosion
                if (wasExploding) {
                    adj.type = 'STANDARD';
                }
                this.destroyBrick(adj, idx);
            }
        }
    }

    triggerScreenShake(intensity, duration) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    }

    updateScreenShake() {
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= 16; // ~60fps
            if (this.screenShake.duration <= 0) {
                this.screenShake.intensity = 0;
            }
        }
    }

    // ========================================================================
    // POWERUPS
    // ========================================================================
    updatePowerupsEntity() {
        const { collected, missed, remaining } = updatePowerupEntities(this.powerups, this.paddle);

        this.powerups = remaining;

        // Handle collected powerups
        for (const powerup of collected) {
            this.applyPowerup(powerup.type);
            this.audio.playSound('powerup');
        }

        // Handle missed powerups (TypeScript level penalty)
        if (LEVELS[this.state.level].mechanics.includes('penalty_miss_powerup')) {
            for (const powerup of missed) {
                if (powerup.positive) {
                    this.state.score = Math.max(0, this.state.score - 100);
                    this.updateUI();
                }
            }
        }
    }

    applyPowerup(type) {
        const duration = CONFIG.POWERUP_DURATION[type] || 10000;

        // Get current stack count BEFORE activating (to determine if this is a stack)
        const currentStacks = this.state.getPowerupStacks(type);

        switch (type) {
            case 'MULTIBALL':
                this.addMultiBall();
                break;

            case 'WIDE_PADDLE': {
                // Stack effect: 1.4x -> 1.8x
                const stacks = this.state.activatePowerup('WIDE_PADDLE', duration);
                const widthMultiplier = stacks === 1 ? 1.4 : 1.8;
                setPaddleWidthMultiplier(this.paddle, widthMultiplier);
                break;
            }

            case 'SLOWMO': {
                // Stack effect: 0.75x -> 0.55x (slower)
                const stacks = this.state.activatePowerup('SLOWMO', duration);
                const speedMultiplier = stacks === 1 ? 0.75 : 0.55;
                for (const ball of this.balls) {
                    setBallSpeedMultiplier(ball, speedMultiplier);
                }
                break;
            }

            case 'LASER':
                this.state.activatePowerup('LASER', duration);
                break;

            case 'SHIELD': {
                // Don't overwrite permanent shield in zen mode
                if (this.shield && this.shield.permanent) {
                    break;
                }
                // Stack effect: extends duration
                const stacks = this.state.activatePowerup('SHIELD', duration);
                const shieldDuration = stacks === 1 ? duration : duration * 1.5;
                this.shield = { active: true, expiry: Date.now() + shieldDuration };
                break;
            }

            case 'MAGNET': {
                // Stack effect: more catches
                const catches = currentStacks > 0 ? 5 : 3;
                enableMagnet(this.paddle, catches);
                break;
            }

            case 'MINI_PADDLE': {
                // Stack effect: 0.7x -> 0.5x (smaller)
                const stacks = this.state.activatePowerup('MINI_PADDLE', duration);
                const widthMultiplier = stacks === 1 ? 0.7 : 0.5;
                setPaddleWidthMultiplier(this.paddle, widthMultiplier);
                break;
            }

            case 'FAST_BALL': {
                // Stack effect: 1.3x -> 1.6x (faster)
                const stacks = this.state.activatePowerup('FAST_BALL', duration);
                const speedMultiplier = stacks === 1 ? 1.3 : 1.6;
                for (const ball of this.balls) {
                    setBallSpeedMultiplier(ball, speedMultiplier);
                }
                break;
            }

            case 'GLITCH':
                for (const ball of this.balls) {
                    ball.visible = false;
                }
                this.state.activatePowerup('GLITCH', duration);
                break;

            case 'FIREBALL':
                for (const ball of this.balls) {
                    enableFireball(ball);
                }
                this.state.activatePowerup('FIREBALL', duration);
                break;

            case 'INVERT_CONTROLS':
                enableInvertedControls(this.paddle);
                this.state.activatePowerup('INVERT_CONTROLS', duration);
                break;

            case 'SPLIT_PADDLE':
                enableSplitPaddle(this.paddle);
                this.state.activatePowerup('SPLIT_PADDLE', duration);
                break;
        }

        updatePowerupIndicators(document.getElementById('active-powerups'), this.state.activePowerups);
    }

    addMultiBall() {
        if (this.balls.length >= CONFIG.MAX_BALLS) return;

        const sourceBall = this.balls.find(b => !b.stuck) || this.balls[0];
        const newBalls = createMultiBalls(sourceBall, 2, CONFIG.MAX_BALLS, this.balls.length);

        this.balls.push(...newBalls);
    }

    updatePowerupTimers() {
        const expired = this.state.getExpiredPowerups();

        for (const type of expired) {
            this.expirePowerup(type);
        }

        // Shield expiry (skip permanent shields from zen mode)
        if (this.shield && !this.shield.permanent && this.shield.expiry && Date.now() >= this.shield.expiry) {
            this.shield = null;
        }

        updatePowerupIndicators(document.getElementById('active-powerups'), this.state.activePowerups);
    }

    expirePowerup(type) {
        switch (type) {
            case 'WIDE_PADDLE':
            case 'MINI_PADDLE':
                resetPaddleWidth(this.paddle);
                break;

            case 'SLOWMO':
            case 'FAST_BALL':
                for (const ball of this.balls) {
                    resetBallSpeed(ball);
                }
                break;

            case 'GLITCH':
                for (const ball of this.balls) {
                    ball.visible = true;
                }
                break;

            case 'SHIELD':
                // Don't clear permanent shield from zen mode
                if (!this.shield || !this.shield.permanent) {
                    this.shield = null;
                }
                break;

            case 'FIREBALL':
                for (const ball of this.balls) {
                    disableFireball(ball);
                }
                break;

            case 'INVERT_CONTROLS':
                disableInvertedControls(this.paddle);
                break;

            case 'SPLIT_PADDLE':
                disableSplitPaddle(this.paddle);
                break;
        }
    }

    // ========================================================================
    // LASERS
    // ========================================================================
    updateLasersEntity() {
        if (this.state.isPowerupActive('LASER')) {
            const shouldFire = this.input.isSpacePressed() || this.fireLaserOnClick;
            if (shouldFire) {
                // Force fire on click for guaranteed response
                const newLasers = fireLasers(this.paddle, this.lasers, 10, this.fireLaserOnClick);
                if (newLasers) {
                    this.lasers.push(...newLasers);
                    this.audio.playSound('laser');
                }
            }
        }
        // Reset click flag after processing
        this.fireLaserOnClick = false;

        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            updateLaserPosition(laser);

            // Check brick collisions
            let hitBrick = false;
            for (let j = this.bricks.length - 1; j >= 0; j--) {
                const brick = this.bricks[j];
                // Skip destroyed bricks (for bonus level regeneration)
                if (brick.destroyed) continue;
                if (checkLaserBrickCollision(laser, brick)) {
                    this.handleBrickHit(brick, j);
                    hitBrick = true;
                    break;
                }
            }

            if (hitBrick || isLaserOffScreen(laser)) {
                this.lasers.splice(i, 1);
            }
        }
    }

    // ========================================================================
    // PARTICLES
    // ========================================================================
    spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 8;
            this.particles.push({
                x,
                y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                life: 1,
                color,
                size: Math.random() * 5 + 2,
                decay: 0.015 + Math.random() * 0.015, // Variable decay for more natural look
                glow: Math.random() > 0.5, // Some particles glow
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.dx;
            p.y += p.dy;
            p.life -= p.decay || 0.02;
            p.dy += 0.15; // Lighter gravity for floatier particles
            p.dx *= 0.98; // Air resistance
            p.size *= 0.99; // Shrink over time

            if (p.life <= 0 || p.size < 0.5) {
                this.particles.splice(i, 1);
            }
        }
    }

    // ========================================================================
    // FLOATING TEXT
    // ========================================================================
    spawnFloatingText(x, y, text, color) {
        this.floatingTexts.push({
            x,
            y,
            text,
            color,
            life: 1,
            dy: -2,
        });
    }

    updateFloatingTexts() {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.dy;
            ft.life -= 0.02;

            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    // ========================================================================
    // BALL TRAIL
    // ========================================================================
    updateBallTrail() {
        // Add current ball positions to trail
        for (const ball of this.balls) {
            if (!ball.stuck && ball.visible) {
                this.ballTrail.push({
                    x: ball.x,
                    y: ball.y,
                    life: 1,
                });
            }
        }

        // Update existing trail points
        for (let i = this.ballTrail.length - 1; i >= 0; i--) {
            this.ballTrail[i].life -= 0.1;
            if (this.ballTrail[i].life <= 0) {
                this.ballTrail.splice(i, 1);
            }
        }

        // Limit trail length
        while (this.ballTrail.length > 20) {
            this.ballTrail.shift();
        }
    }

    // ========================================================================
    // RENDERING
    // ========================================================================
    render() {
        // Apply screen shake
        if (this.screenShake.intensity > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake.intensity;
            const shakeY = (Math.random() - 0.5) * this.screenShake.intensity;
            this.ctx.save();
            this.ctx.translate(shakeX, shakeY);
        }

        render(this.ctx, {
            levelData: LEVELS[this.state.level],
            paddle: this.paddle,
            balls: this.balls,
            bricks: this.bricks,
            powerups: this.powerups,
            lasers: this.lasers,
            shield: this.shield,
            particles: this.particles,
            floatingTexts: this.floatingTexts,
            ballTrail: this.ballTrail,
            activePowerups: this.state.activePowerups,
        });

        // Restore after screen shake
        if (this.screenShake.intensity > 0) {
            this.ctx.restore();
        }
    }

    // ========================================================================
    // UTILITIES
    // ========================================================================
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    checkLevelComplete() {
        const levelData = LEVELS[this.state.level];

        // Bonus levels: time-based completion
        if (levelData.bonus) {
            if (Date.now() >= this.state.bonusEndTime) {
                this.levelComplete();
            }
            return;
        }

        // Normal levels: all breakable bricks destroyed
        const breakableBricks = this.bricks.filter(b => b.type !== 'UNBREAKABLE' && !b.destroyed);
        if (breakableBricks.length === 0) {
            this.levelComplete();
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.state.score.toLocaleString();

        const multiplierEl = document.getElementById('multiplier');
        multiplierEl.textContent = `x${this.state.multiplier.toFixed(2)}`;
        multiplierEl.parentElement.classList.toggle('active', this.state.multiplier > 1);

        // Lives as hearts (handle extra lives beyond initial count)
        const lostLives = Math.max(0, CONFIG.INITIAL_LIVES - this.state.lives);
        const hearts = '\u2764\uFE0F'.repeat(this.state.lives) + '\uD83D\uDDA4'.repeat(lostLives);
        document.getElementById('lives').textContent = hearts;
    }

    // ========================================================================
    // HIGH SCORES
    // ========================================================================

    /**
     * Get the current game mode for high scores
     * @returns {string} 'campaign' or bonus type ('roguelike', 'relax', 'doodle')
     */
    getCurrentScoreMode() {
        if (!this.bonusOnlyMode) return 'campaign';
        const levelData = LEVELS[this.state.level];
        return levelData.bonus?.type || 'campaign';
    }

    async loadHighScore() {
        // Load campaign scores for the start screen display
        this.highScores = await loadHighScores('campaign');
        updateHighScoreDisplay(document.getElementById('high-score-display'), this.highScores);
    }

    async saveHighScore() {
        // Prevent duplicate submissions
        if (this.state.scoreSubmitted) {
            return;
        }

        const mode = this.getCurrentScoreMode();
        const playerName = document.getElementById('player-name').value.trim() || 'Anonymous';
        this.highScores = await addHighScore(
            this.highScores,
            playerName,
            this.state.score,
            LEVELS[this.state.level].name,
            mode
        );

        // Only update start screen display for campaign scores
        if (mode === 'campaign') {
            updateHighScoreDisplay(document.getElementById('high-score-display'), this.highScores);
        }

        // Mark score as submitted to prevent duplicates
        this.state.scoreSubmitted = true;

        // Disable the submit button visually
        const submitBtn = document.getElementById('submit-score-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'SCORE SAVED';
        }
    }

    async submitScore() {
        // Disable button immediately to prevent double-clicks during async operation
        const submitBtn = document.getElementById('submit-score-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'SAVING...';
        }

        await this.saveHighScore();
        displayLeaderboard(
            document.getElementById('leaderboard-list'),
            this.highScores,
            this.state.score
        );
    }

    async showHighScores() {
        // Reload campaign scores from database (main menu high scores)
        this.highScores = await loadHighScores('campaign');
        updateHighScoreDisplay(document.getElementById('high-score-display'), this.highScores);

        const listElement = document.getElementById('highscores-full-list');
        const emptyMessage = document.getElementById('highscores-empty');

        listElement.textContent = '';

        if (this.highScores.length === 0) {
            emptyMessage.classList.remove('hidden');
        } else {
            emptyMessage.classList.add('hidden');

            for (let i = 0; i < this.highScores.length; i++) {
                const entry = this.highScores[i];
                const li = document.createElement('li');

                const rankSpan = document.createElement('span');
                rankSpan.className = 'rank';
                rankSpan.textContent = `${i + 1}`;

                const nameSpan = document.createElement('span');
                nameSpan.className = 'name';
                nameSpan.textContent = entry.name;

                const levelSpan = document.createElement('span');
                levelSpan.className = 'level';
                levelSpan.textContent = entry.level;

                const scoreSpan = document.createElement('span');
                scoreSpan.className = 'score';
                scoreSpan.textContent = entry.score.toLocaleString();

                li.appendChild(rankSpan);
                li.appendChild(nameSpan);
                li.appendChild(levelSpan);
                li.appendChild(scoreSpan);
                listElement.appendChild(li);
            }
        }

        this.showScreen('highscores');
    }

    // ========================================================================
    // SOUND
    // ========================================================================
    toggleSound() {
        const enabled = this.audio.toggle();
        document.getElementById('sound-icon').textContent = enabled ? '\uD83D\uDD0A' : '\uD83D\uDD07';
        this.state.soundEnabled = enabled;
    }
}

// ============================================================================
// INITIALIZE GAME
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    window.game = new CodeBreakout();
});

export { CodeBreakout };
