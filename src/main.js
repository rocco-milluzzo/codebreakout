// CODEBREAKOUT - Main Game Module
// ============================================================================
// Main CodeBreakout class and game loop
// ============================================================================

// Configuration and data
import { CONFIG } from './config.js';
import { LEVELS, CODE_LEVEL_INDICES, BONUS_LEVEL_INDICES } from './levels.js';
import { POWERUP_TYPES } from './powerups.js';
import { BRICK_TYPES } from './brickTypes.js';

// State
import { GameState } from './state.js';

// Entities
import { createPaddle, updatePaddle, setPaddleWidthMultiplier, resetPaddleWidth, enableMagnet, useMagnetCatch, enableInvertedControls, disableInvertedControls, enableSplitPaddle, disableSplitPaddle } from './entities/paddle.js';
import { createBall, createBallOnPaddle, launchBall, updateBallPosition, checkWallCollision, isBallOutOfBounds, bounceOffShield, updateBallVelocity, setBallSpeedMultiplier, resetBallSpeed, createMultiBalls, syncBallWithPaddle, enableFireball, disableFireball, enableDoodleMode, applyDoodleGravity, applyDoodleJump } from './entities/ball.js';
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

        // New bonus mode state
        this.bullets = [];
        this.boss = null;
        this.gravityFlipped = false;
        this.lastFlipTime = 0;
        this.lastBulletTime = 0;
        this.lastTowerSpawnTime = 0;
        this.multiballGoalReached = false;
        this.levelIntroTimeout = null;

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
        document.getElementById('classic-btn').addEventListener('click', () => this.startGame('classic'));
        document.getElementById('campaign-btn').addEventListener('click', () => this.startGame('campaign'));
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
        document.getElementById('bonus-bullet-btn').addEventListener('click', () => this.startBonusLevel('bulletHell'));
        document.getElementById('bonus-tower-btn').addEventListener('click', () => this.startBonusLevel('towerDefense'));
        document.getElementById('bonus-madness-btn').addEventListener('click', () => this.startBonusLevel('multiballMadness'));
        document.getElementById('bonus-boss-btn').addEventListener('click', () => this.startBonusLevel('boss'));
        document.getElementById('bonus-speed-btn').addEventListener('click', () => this.startBonusLevel('speedRun'));

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
    /**
     * Build level sequence based on game mode
     * @param {string} mode - 'classic', 'campaign', or 'bonus'
     * @returns {number[]} Array of level indices
     */
    buildLevelSequence(mode) {
        if (mode === 'classic') {
            // Only code levels (no bonus)
            return [...CODE_LEVEL_INDICES];
        }
        if (mode === 'campaign') {
            // Insert a bonus after every 2 code levels
            const sequence = [];
            let bonusIndex = 0;
            CODE_LEVEL_INDICES.forEach((levelIdx, i) => {
                sequence.push(levelIdx);
                // After every 2 code levels, add a bonus
                if ((i + 1) % 2 === 0 && bonusIndex < BONUS_LEVEL_INDICES.length) {
                    sequence.push(BONUS_LEVEL_INDICES[bonusIndex]);
                    bonusIndex++;
                }
            });
            return sequence;
        }
        // 'bonus' mode - sequence set by startBonusLevel
        return [];
    }

    startGame(mode = 'classic') {
        // Cancel any existing game loop and intro timeout
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.levelIntroTimeout) {
            clearTimeout(this.levelIntroTimeout);
            this.levelIntroTimeout = null;
        }

        this.state.reset();
        this.state.gameMode = mode;
        this.state.levelSequence = this.buildLevelSequence(mode);
        this.state.sequenceIndex = 0;
        this.state.level = this.state.levelSequence[0];
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
            // Restart with same game mode
            this.startGame(this.state.gameMode);
        }
    }

    startBonusLevel(bonusType) {
        // Cancel any existing game loop and intro timeout
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.levelIntroTimeout) {
            clearTimeout(this.levelIntroTimeout);
            this.levelIntroTimeout = null;
        }

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

        // Cancel any existing intro timeout
        if (this.levelIntroTimeout) {
            clearTimeout(this.levelIntroTimeout);
        }

        // Update intro screen content
        const levelNumberEl = document.getElementById('intro-level-number');
        if (levelData.bonus) {
            // Hide level number for bonus stages
            levelNumberEl.style.display = 'none';
        } else {
            levelNumberEl.style.display = '';
            levelNumberEl.textContent = `LEVEL ${this.state.level + 1}`;
        }
        document.getElementById('intro-level-name').textContent = levelData.name;
        document.getElementById('intro-level-name').style.color = levelData.color;
        document.getElementById('intro-level-desc').textContent = levelData.description;

        this.showScreen('level-intro');

        // Auto-hide after 1.5 seconds and start level
        this.levelIntroTimeout = setTimeout(() => {
            this.levelIntroTimeout = null;
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

        // Reset new bonus mode state
        this.bullets = [];
        this.boss = null;
        this.gravityFlipped = false;
        this.lastFlipTime = Date.now();
        this.lastBulletTime = Date.now();
        this.lastTowerSpawnTime = Date.now();
        this.multiballGoalReached = false;

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

            // Boss battle mode
            if (levelData.bonus.type === 'boss') {
                this.boss = {
                    x: CONFIG.CANVAS_WIDTH / 2 - 100,
                    y: 80,
                    width: 200,
                    height: 60,
                    health: levelData.bonus.bossHealth,
                    maxHealth: levelData.bonus.bossHealth,
                    moveDir: 1,
                    moveSpeed: levelData.bonus.bossMoveSpeed,
                    lastAttackTime: Date.now(),
                    attackInterval: levelData.bonus.bossAttackInterval,
                    phase: 1, // Boss gets harder as health drops
                };
            }

            // Gravity flip mode - set paddle to normal position initially
            if (levelData.bonus.type === 'gravityFlip') {
                this.gravityFlipped = false;
                this.paddle.y = CONFIG.CANVAS_HEIGHT - CONFIG.PADDLE_Y_OFFSET;
            }

            // Speed Run wave-based mode
            if (levelData.bonus.type === 'speedRun') {
                this.speedRunWave = 1;
                this.speedRunWaveCleared = false;
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
        this.state.sequenceIndex++;

        if (this.state.sequenceIndex >= this.state.levelSequence.length) {
            // Game complete!
            this.gameOver(true);
            return;
        }

        this.state.level = this.state.levelSequence[this.state.sequenceIndex];
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

        // Next level preview (use sequence system)
        const nextSequenceIndex = this.state.sequenceIndex + 1;
        if (nextSequenceIndex < this.state.levelSequence.length) {
            const nextLevelIndex = this.state.levelSequence[nextSequenceIndex];
            document.getElementById('next-level-name').textContent = `Next: ${LEVELS[nextLevelIndex].name}`;
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

        // Update game over title based on victory and mode
        const gameOverTitle = document.querySelector('#game-over-screen h2');
        if (gameOverTitle) {
            if (this.bonusOnlyMode) {
                gameOverTitle.textContent = 'BONUS COMPLETE!';
                gameOverTitle.style.color = LEVELS[this.state.level].color;
            } else if (victory) {
                const modeTitle = this.state.gameMode === 'classic' ? 'CLASSIC COMPLETE!' : 'CAMPAIGN COMPLETE!';
                gameOverTitle.textContent = modeTitle;
                gameOverTitle.style.color = '#00ff88';
            } else {
                gameOverTitle.textContent = 'GAME OVER';
                gameOverTitle.style.color = '#ff4455';
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
        this.updateBullets();
        this.updateBoss();
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

        // BULLET HELL: Bricks shoot bullets at paddle (difficulty scales over time)
        if (levelData.bonus.type === 'bulletHell') {
            const elapsed = now - this.state.levelStartTime;
            const progress = Math.min(1, elapsed / levelData.bonus.duration);
            const currentInterval = levelData.bonus.bulletInterval -
                (levelData.bonus.bulletInterval - (levelData.bonus.minBulletInterval || 1500)) * progress;

            if (now - this.lastBulletTime >= currentInterval) {
                this.lastBulletTime = now;
                this.spawnBulletHellBullets(levelData);
            }
        }

        // GRAVITY FLIP: Flip gravity periodically
        if (levelData.bonus.type === 'gravityFlip') {
            if (now - this.lastFlipTime >= levelData.bonus.flipInterval) {
                this.lastFlipTime = now;
                this.gravityFlipped = !this.gravityFlipped;
                this.showGravityFlipEffect();
                // Reposition paddle
                if (this.gravityFlipped) {
                    this.paddle.y = 50;
                } else {
                    this.paddle.y = CONFIG.CANVAS_HEIGHT - CONFIG.PADDLE_Y_OFFSET;
                }
            }
        }

        // TOWER DEFENSE: Bricks descend and spawn new rows (only after ball is launched)
        if (levelData.bonus.type === 'towerDefense' && this.state.isLaunched) {
            // Move all bricks down
            for (const brick of this.bricks) {
                if (!brick.destroyed) {
                    brick.y += levelData.bonus.descentSpeed;
                    // Check if any brick reached bottom - game over!
                    if (brick.y + brick.height >= CONFIG.CANVAS_HEIGHT - 80) {
                        this.spawnFloatingText(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, 'INVASION!', '#ff0000');
                        this.gameOver(false);
                        return;
                    }
                }
            }
            // Spawn new row periodically
            if (now - this.lastTowerSpawnTime >= levelData.bonus.spawnInterval) {
                this.lastTowerSpawnTime = now;
                this.spawnTowerDefenseRow();
            }
        }

        // MULTIBALL MADNESS: Check if goal reached
        if (levelData.bonus.type === 'multiballMadness') {
            const ballCountEl = document.getElementById('ball-count');
            if (ballCountEl) {
                ballCountEl.textContent = `${this.balls.length}/${levelData.bonus.targetBalls}`;
            }
            if (!this.multiballGoalReached && this.balls.length >= levelData.bonus.targetBalls) {
                this.multiballGoalReached = true;
                this.spawnFloatingText(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, 'GOAL REACHED!', '#00ffff');
                this.state.score += 10000; // Big bonus
                this.audio.playSound('powerup');
            }
        }

        // SPEED RUN: Wave-based challenge
        if (levelData.bonus.type === 'speedRun') {
            // Multiplier increases faster in speed run
            if (this.state.multiplier < CONFIG.MAX_MULTIPLIER) {
                this.state.multiplier += 0.001;
            }

            // Check if all bricks are destroyed (wave cleared)
            const remainingBricks = this.bricks.filter(b => !b.destroyed && b.maxHits > 0);
            if (remainingBricks.length === 0 && !this.speedRunWaveCleared) {
                this.speedRunWaveCleared = true;
                // Award wave bonus
                const waveBonus = levelData.bonus.waveBonus || 2000;
                this.state.score += waveBonus * this.speedRunWave;
                this.spawnFloatingText(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2,
                    `WAVE ${this.speedRunWave} CLEARED! +${waveBonus * this.speedRunWave}`, '#ffff00');
                this.audio.playSound('levelUp');

                // Spawn next wave after brief delay
                setTimeout(() => {
                    this.speedRunWave++;
                    this.spawnSpeedRunWave();
                    this.speedRunWaveCleared = false;
                    // Reset timer for new wave
                    this.state.bonusEndTime = Date.now() + levelData.bonus.duration;
                    this.spawnFloatingText(CONFIG.CANVAS_WIDTH / 2, 100, `WAVE ${this.speedRunWave}`, '#ff6600');
                }, 500);
            }
        }
    }

    spawnBulletHellBullets(levelData) {
        const activeBricks = this.bricks.filter(b => !b.destroyed);
        if (activeBricks.length === 0) return;

        // Calculate difficulty based on elapsed time (scales from initial to max over duration)
        const elapsed = Date.now() - this.state.levelStartTime;
        const progress = Math.min(1, elapsed / levelData.bonus.duration);
        const initialShooters = levelData.bonus.initialShooters || 1;
        const maxShooters = levelData.bonus.maxShooters || 4;
        const currentMaxShooters = Math.floor(initialShooters + (maxShooters - initialShooters) * progress);

        const shooterCount = Math.min(activeBricks.length, currentMaxShooters);
        const shuffled = [...activeBricks].sort(() => Math.random() - 0.5);
        const shooters = shuffled.slice(0, shooterCount);

        // Scale bullet speed with progress
        const minSpeed = levelData.bonus.bulletSpeed || 2.5;
        const maxSpeed = levelData.bonus.maxBulletSpeed || 5;
        const bulletSpeed = minSpeed + (maxSpeed - minSpeed) * progress;

        for (const brick of shooters) {
            const brickCenterX = brick.x + brick.width / 2;
            const brickCenterY = brick.y + brick.height / 2;
            const paddleCenterX = this.paddle.x + this.paddle.width / 2;
            const paddleCenterY = this.paddle.y + this.paddle.height / 2;

            // Calculate direction to paddle
            const dx = paddleCenterX - brickCenterX;
            const dy = paddleCenterY - brickCenterY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            this.bullets.push({
                x: brickCenterX,
                y: brickCenterY,
                dx: (dx / dist) * bulletSpeed,
                dy: (dy / dist) * bulletSpeed,
                radius: 5,
            });
        }
        this.audio.playSound('laser');
    }

    showGravityFlipEffect() {
        const flipText = document.createElement('div');
        flipText.className = 'gravity-flip-text';
        flipText.textContent = 'GRAVITY FLIP!';
        document.getElementById('game-container').appendChild(flipText);
        setTimeout(() => flipText.remove(), 1500);
        this.audio.playSound('powerup');
    }

    spawnTowerDefenseRow() {
        const cols = 10;
        const brickTypes = [1, 1, 1, 2, 2, 3]; // Weighted random types
        const levelData = LEVELS[this.state.level];

        for (let c = 0; c < cols; c++) {
            // 70% chance of brick
            if (Math.random() < 0.7) {
                const typeValue = brickTypes[Math.floor(Math.random() * brickTypes.length)];
                let type = 'STANDARD';
                let maxHits = 1;
                if (typeValue === 2) {
                    type = 'STRONG';
                    maxHits = 2;
                } else if (typeValue === 3) {
                    type = 'TOUGH';
                    maxHits = 3;
                }

                this.bricks.push({
                    x: CONFIG.BRICK_OFFSET_LEFT + c * (CONFIG.BRICK_WIDTH + CONFIG.BRICK_PADDING),
                    y: CONFIG.BRICK_OFFSET_TOP,
                    width: CONFIG.BRICK_WIDTH,
                    height: CONFIG.BRICK_HEIGHT,
                    type,
                    hits: 0,
                    maxHits,
                    color: levelData.color,
                    destroyed: false,
                });
            }
        }
    }

    spawnSpeedRunWave() {
        const levelData = LEVELS[this.state.level];
        const wave = this.speedRunWave;

        // More rows and cols as waves progress
        const rows = Math.min(3 + Math.floor(wave / 2), 6);
        const cols = Math.min(8 + wave, 12);

        // More tough bricks as waves progress
        const toughChance = Math.min(0.1 + wave * 0.05, 0.4);
        const strongChance = Math.min(0.2 + wave * 0.05, 0.5);

        // Wave colors cycle through rainbow
        const waveColors = ['#ff6600', '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff0066'];
        const waveColor = waveColors[(wave - 1) % waveColors.length];

        // Clear any destroyed bricks from array
        this.bricks = this.bricks.filter(b => !b.destroyed);
        this.state.destroyedBricks = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Skip some bricks randomly for variety
                if (Math.random() < 0.15) continue;

                let type = 'STANDARD';
                let maxHits = 1;
                const roll = Math.random();
                if (roll < toughChance) {
                    type = 'TOUGH';
                    maxHits = 3;
                } else if (roll < toughChance + strongChance) {
                    type = 'STRONG';
                    maxHits = 2;
                }

                const x = CONFIG.BRICK_OFFSET_LEFT + c * (CONFIG.BRICK_WIDTH + CONFIG.BRICK_PADDING);
                const y = CONFIG.BRICK_OFFSET_TOP + r * (CONFIG.BRICK_HEIGHT + CONFIG.BRICK_PADDING);

                this.bricks.push({
                    x,
                    y,
                    width: CONFIG.BRICK_WIDTH,
                    height: CONFIG.BRICK_HEIGHT,
                    type,
                    hits: 0,
                    maxHits,
                    color: waveColor,
                    destroyed: false,
                });
            }
        }

        this.audio.playSound('brick');
    }

    updateBullets() {
        if (this.bullets.length === 0) return;

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;

            // Check collision with paddle
            if (bullet.x >= this.paddle.x &&
                bullet.x <= this.paddle.x + this.paddle.width &&
                bullet.y >= this.paddle.y &&
                bullet.y <= this.paddle.y + this.paddle.height) {
                // Hit paddle!
                this.bullets.splice(i, 1);
                this.triggerScreenShake(5, 200);
                this.spawnParticles(bullet.x, bullet.y, '#ff0066', 10);
                this.audio.playSound('brick');
                // Lose a life when hit by bullet (bullet hell or boss battle)
                const levelData = LEVELS[this.state.level];
                if (levelData.bonus && (levelData.bonus.type === 'bulletHell' || levelData.bonus.type === 'boss')) {
                    if (this.state.lives > 0) {
                        this.state.lives--;
                        this.updateUI();
                        this.spawnFloatingText(this.paddle.x + this.paddle.width / 2, this.paddle.y, 'HIT!', '#ff0066');
                        if (this.state.lives <= 0) {
                            this.gameOver(false);
                            return; // Stop processing bullets after game over
                        }
                    }
                }
                continue;
            }

            // Remove if off screen
            if (bullet.y > CONFIG.CANVAS_HEIGHT || bullet.y < 0 ||
                bullet.x < 0 || bullet.x > CONFIG.CANVAS_WIDTH) {
                this.bullets.splice(i, 1);
            }
        }
    }

    updateBoss() {
        if (!this.boss) return;

        const now = Date.now();
        const levelData = LEVELS[this.state.level];

        // Initialize vertical movement if not set
        if (this.boss.moveDirY === undefined) {
            this.boss.moveDirY = 1;
            this.boss.verticalSpeed = 0.5;
            this.boss.baseY = this.boss.y;
            this.boss.lastDirChange = now;
        }

        // Move boss horizontally
        this.boss.x += this.boss.moveDir * this.boss.moveSpeed;

        // Move boss vertically (oscillate)
        this.boss.y += this.boss.moveDirY * this.boss.verticalSpeed;

        // Bounce off walls (horizontal)
        if (this.boss.x <= 20) {
            this.boss.x = 20;
            this.boss.moveDir = 1;
        } else if (this.boss.x + this.boss.width >= CONFIG.CANVAS_WIDTH - 20) {
            this.boss.x = CONFIG.CANVAS_WIDTH - 20 - this.boss.width;
            this.boss.moveDir = -1;
        }

        // Bounce vertically within range
        const minY = 50;
        const maxY = 180;
        if (this.boss.y <= minY) {
            this.boss.y = minY;
            this.boss.moveDirY = 1;
        } else if (this.boss.y >= maxY) {
            this.boss.y = maxY;
            this.boss.moveDirY = -1;
        }

        // Random direction changes (more frequent in later phases)
        const dirChangeInterval = this.boss.phase === 3 ? 800 : (this.boss.phase === 2 ? 1200 : 2000);
        if (now - this.boss.lastDirChange >= dirChangeInterval && Math.random() < 0.3) {
            this.boss.moveDir *= -1;
            this.boss.lastDirChange = now;
        }

        // Update boss phase based on health
        const healthPercent = this.boss.health / this.boss.maxHealth;
        if (healthPercent <= 0.3) {
            this.boss.phase = 3;
            this.boss.moveSpeed = levelData.bonus.bossMoveSpeed * 2.5;
            this.boss.verticalSpeed = 1.5;
        } else if (healthPercent <= 0.6) {
            this.boss.phase = 2;
            this.boss.moveSpeed = levelData.bonus.bossMoveSpeed * 1.8;
            this.boss.verticalSpeed = 1.0;
        }

        // Boss attack - shoots bullets
        const attackInterval = this.boss.phase === 3 ? 1500 : (this.boss.phase === 2 ? 2000 : this.boss.attackInterval);
        if (now - this.boss.lastAttackTime >= attackInterval) {
            this.boss.lastAttackTime = now;
            this.spawnBossAttack();
        }

        // Check collision with balls
        for (const ball of this.balls) {
            if (ball.stuck) continue;

            // Cooldown to prevent multiple hits from same ball
            if (ball.bossHitCooldown && now - ball.bossHitCooldown < 200) continue;

            const ballRight = ball.x + ball.radius;
            const ballLeft = ball.x - ball.radius;
            const ballTop = ball.y - ball.radius;
            const ballBottom = ball.y + ball.radius;

            if (ballRight >= this.boss.x &&
                ballLeft <= this.boss.x + this.boss.width &&
                ballBottom >= this.boss.y &&
                ballTop <= this.boss.y + this.boss.height) {
                // Hit boss! Deal 5 damage per hit
                const damage = 5;
                this.boss.health -= damage;
                ball.bossHitCooldown = now;
                ball.dy = Math.abs(ball.dy); // Bounce down
                this.triggerScreenShake(10, 400);
                this.spawnParticles(ball.x, ball.y, '#ff0000', 20);
                this.audio.playSound('brick');
                this.state.score += 200;

                // Show damage floating text
                this.spawnFloatingText(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height, `-${damage}`, '#ff6600');

                // Check if boss defeated
                if (this.boss.health <= 0) {
                    this.spawnFloatingText(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, 'BOSS DEFEATED!', '#ff0000');
                    this.state.score += 50000; // Huge bonus
                    this.triggerScreenShake(15, 500);
                    // Spawn victory particles
                    for (let i = 0; i < 50; i++) {
                        this.spawnParticles(
                            this.boss.x + Math.random() * this.boss.width,
                            this.boss.y + Math.random() * this.boss.height,
                            ['#ff0000', '#ff6600', '#ffff00'][Math.floor(Math.random() * 3)],
                            5
                        );
                    }
                    this.boss = null;
                    this.levelComplete();
                    return;
                }
            }
        }
    }

    spawnBossAttack() {
        if (!this.boss) return;

        const bossX = this.boss.x + this.boss.width / 2;
        const bossY = this.boss.y + this.boss.height;
        const bulletSpeed = 4;

        // Attack pattern based on phase
        if (this.boss.phase === 1) {
            // Phase 1: Single aimed shot
            const paddleX = this.paddle.x + this.paddle.width / 2;
            const paddleY = this.paddle.y;
            const dx = paddleX - bossX;
            const dy = paddleY - bossY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            this.bullets.push({
                x: bossX,
                y: bossY,
                dx: (dx / dist) * bulletSpeed,
                dy: (dy / dist) * bulletSpeed,
                radius: 6,
            });
        } else if (this.boss.phase === 2) {
            // Phase 2: Spread shot (3 bullets)
            for (let i = -1; i <= 1; i++) {
                const angle = Math.PI / 2 + i * 0.3; // Spread angle
                this.bullets.push({
                    x: bossX + i * 30,
                    y: bossY,
                    dx: Math.cos(angle) * bulletSpeed,
                    dy: Math.sin(angle) * bulletSpeed,
                    radius: 5,
                });
            }
        } else {
            // Phase 3: Rain of bullets
            for (let i = 0; i < 5; i++) {
                const offsetX = (Math.random() - 0.5) * this.boss.width;
                this.bullets.push({
                    x: bossX + offsetX,
                    y: bossY,
                    dx: (Math.random() - 0.5) * 2,
                    dy: bulletSpeed,
                    radius: 4,
                });
            }
        }
        this.audio.playSound('laser');
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

            // Bottom/Top - lose ball (depends on gravity flip)
            const isOutOfBounds = this.gravityFlipped
                ? ball.y + ball.radius < 0  // Ball goes above screen when gravity flipped
                : isBallOutOfBounds(ball);  // Ball goes below screen normally

            if (isOutOfBounds) {
                if (this.shield && !this.gravityFlipped) {
                    // Shield saves the ball (only works for normal gravity)
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

        // MULTIBALL MADNESS: Spawn a new ball from destroyed brick
        if (levelData.bonus && levelData.bonus.type === 'multiballMadness') {
            const maxBalls = levelData.bonus.maxBalls || 100;
            if (this.balls.length < maxBalls) {
                const newBall = createBall(
                    center.x,
                    center.y,
                    levelData.ballSpeed
                );
                // Random direction downward
                const angle = Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 3);
                newBall.dx = Math.cos(angle) * newBall.speed;
                newBall.dy = Math.sin(angle) * newBall.speed;
                newBall.stuck = false;
                this.balls.push(newBall);
            }
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

        // Render bullets (bullet hell / boss battle)
        this.renderBullets();

        // Render boss
        this.renderBoss();

        // Render tower defense danger zone
        this.renderTowerDefenseZone();

        // Render speed run wave counter
        this.renderSpeedRunWave();

        // Restore after screen shake
        if (this.screenShake.intensity > 0) {
            this.ctx.restore();
        }
    }

    renderBullets() {
        if (this.bullets.length === 0) return;

        for (const bullet of this.bullets) {
            // Outer glow
            this.ctx.save();
            this.ctx.shadowColor = '#ff0066';
            this.ctx.shadowBlur = 10;

            // Gradient for bullet
            const gradient = this.ctx.createRadialGradient(
                bullet.x, bullet.y, 0,
                bullet.x, bullet.y, bullet.radius * 2
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, '#ff0066');
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, bullet.radius * 2, 0, Math.PI * 2);
            this.ctx.fill();

            // Core
            this.ctx.fillStyle = '#ff0066';
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        }
    }

    renderBoss() {
        if (!this.boss) return;

        const { x, y, width, height, health, maxHealth, phase } = this.boss;

        // Boss body
        this.ctx.save();

        // Outer glow based on phase
        const glowColors = ['#ff0000', '#ff6600', '#ff00ff'];
        this.ctx.shadowColor = glowColors[phase - 1] || '#ff0000';
        this.ctx.shadowBlur = 15 + Math.sin(Date.now() / 100) * 5;

        // Main body gradient
        const bodyGradient = this.ctx.createLinearGradient(x, y, x, y + height);
        if (phase === 3) {
            bodyGradient.addColorStop(0, '#ff00ff');
            bodyGradient.addColorStop(0.5, '#aa0066');
            bodyGradient.addColorStop(1, '#660044');
        } else if (phase === 2) {
            bodyGradient.addColorStop(0, '#ff6600');
            bodyGradient.addColorStop(0.5, '#cc3300');
            bodyGradient.addColorStop(1, '#881100');
        } else {
            bodyGradient.addColorStop(0, '#ff4444');
            bodyGradient.addColorStop(0.5, '#cc0000');
            bodyGradient.addColorStop(1, '#880000');
        }

        this.ctx.fillStyle = bodyGradient;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, 8);
        this.ctx.fill();

        // Boss face - angry eyes
        const eyeSize = 10;
        const eyeY = y + height * 0.35;
        const leftEyeX = x + width * 0.3;
        const rightEyeX = x + width * 0.7;

        // Eye sockets
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(leftEyeX, eyeY, eyeSize + 3, 0, Math.PI * 2);
        this.ctx.arc(rightEyeX, eyeY, eyeSize + 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Glowing eyes
        const eyeColor = phase === 3 ? '#ff00ff' : (phase === 2 ? '#ff6600' : '#ffff00');
        this.ctx.fillStyle = eyeColor;
        this.ctx.beginPath();
        this.ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Pupils that track paddle
        const paddleX = this.paddle.x + this.paddle.width / 2;
        const maxOffset = 4;
        const leftOffset = Math.min(maxOffset, Math.max(-maxOffset, (paddleX - leftEyeX) / 50));
        const rightOffset = Math.min(maxOffset, Math.max(-maxOffset, (paddleX - rightEyeX) / 50));

        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(leftEyeX + leftOffset, eyeY, 4, 0, Math.PI * 2);
        this.ctx.arc(rightEyeX + rightOffset, eyeY, 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Angry eyebrows
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(leftEyeX - 12, eyeY - 15);
        this.ctx.lineTo(leftEyeX + 12, eyeY - 10);
        this.ctx.moveTo(rightEyeX + 12, eyeY - 15);
        this.ctx.lineTo(rightEyeX - 12, eyeY - 10);
        this.ctx.stroke();

        // Mouth
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        const mouthY = y + height * 0.7;
        this.ctx.moveTo(x + width * 0.3, mouthY);
        this.ctx.lineTo(x + width * 0.4, mouthY + 5);
        this.ctx.lineTo(x + width * 0.5, mouthY);
        this.ctx.lineTo(x + width * 0.6, mouthY + 5);
        this.ctx.lineTo(x + width * 0.7, mouthY);
        this.ctx.stroke();

        this.ctx.restore();

        // Health bar background
        const hpBarWidth = width;
        const hpBarHeight = 8;
        const hpBarX = x;
        const hpBarY = y - 15;

        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

        // Health bar fill
        const healthPercent = health / maxHealth;
        let hpColor = '#00ff00';
        if (healthPercent <= 0.3) hpColor = '#ff0000';
        else if (healthPercent <= 0.6) hpColor = '#ffff00';

        this.ctx.fillStyle = hpColor;
        this.ctx.fillRect(hpBarX, hpBarY, hpBarWidth * healthPercent, hpBarHeight);

        // Health bar border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

        // Health text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 10px JetBrains Mono';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${health}/${maxHealth}`, x + width / 2, hpBarY - 3);
    }

    renderTowerDefenseZone() {
        const levelData = LEVELS[this.state.level];
        if (!levelData.bonus || levelData.bonus.type !== 'towerDefense') return;

        // Danger zone line at bottom
        const dangerY = CONFIG.CANVAS_HEIGHT - 80;
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);

        this.ctx.save();
        this.ctx.strokeStyle = `rgba(255, 0, 0, ${0.5 + pulse * 0.5})`;
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, dangerY);
        this.ctx.lineTo(CONFIG.CANVAS_WIDTH, dangerY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Danger zone fill
        this.ctx.fillStyle = `rgba(255, 0, 0, ${0.05 + pulse * 0.05})`;
        this.ctx.fillRect(0, dangerY, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT - dangerY);

        // Warning text
        this.ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + pulse * 0.3})`;
        this.ctx.font = 'bold 12px JetBrains Mono';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DANGER ZONE', CONFIG.CANVAS_WIDTH / 2, dangerY + 15);

        this.ctx.restore();
    }

    renderSpeedRunWave() {
        const levelData = LEVELS[this.state.level];
        if (!levelData.bonus || levelData.bonus.type !== 'speedRun') return;

        const wave = this.speedRunWave || 1;

        this.ctx.save();

        // Wave counter in top-right corner
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'top';

        // Glow effect
        this.ctx.shadowColor = '#ffff00';
        this.ctx.shadowBlur = 10;

        // Wave text
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = 'bold 24px JetBrains Mono';
        this.ctx.fillText(`WAVE ${wave}`, CONFIG.CANVAS_WIDTH - 20, 60);

        this.ctx.restore();
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
            // Safeguard: bonusEndTime must be set (not 0) before checking completion
            if (this.state.bonusEndTime > 0 && Date.now() >= this.state.bonusEndTime) {
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
        const currentLives = Math.max(0, this.state.lives);
        const lostLives = Math.max(0, CONFIG.INITIAL_LIVES - currentLives);
        const hearts = '\u2764\uFE0F'.repeat(currentLives) + '\uD83D\uDDA4'.repeat(lostLives);
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
