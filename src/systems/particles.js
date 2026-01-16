// CODEBREAKOUT - Particle System (Optimized)
// ============================================================================
// Visual juice: particles, trails, screen effects
// Performance optimized with object pooling and particle caps
// ============================================================================

const MAX_PARTICLES = 200;
const MAX_SCREEN_EFFECTS = 5;
const POOL_SIZE = 250;

/**
 * Particle class with reset capability for object pooling
 */
class Particle {
    constructor() {
        this.active = false;
        this.reset(0, 0, {});
    }

    reset(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx ?? (Math.random() - 0.5) * 8;
        this.vy = options.vy ?? (Math.random() - 0.5) * 8;
        this.size = options.size ?? 3 + Math.random() * 4;
        this.color = options.color || '#00ff88';
        this.alpha = 1;
        this.decay = options.decay ?? 0.02 + Math.random() * 0.02;
        this.gravity = options.gravity ?? 0.15;
        this.friction = options.friction ?? 0.98;
        this.type = options.type || 'square';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;
        this.active = true;
        return this;
    }

    update() {
        if (!this.active) return false;

        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        this.rotation += this.rotationSpeed;
        this.size *= 0.98;

        if (this.alpha <= 0 || this.size <= 0.5) {
            this.active = false;
            return false;
        }
        return true;
    }
}

/**
 * Screen effect class for full-screen visual effects
 */
class ScreenEffect {
    constructor() {
        this.active = false;
        this.reset('flash', {});
    }

    reset(type, options = {}) {
        this.type = type;
        this.duration = options.duration || 500;
        this.startTime = Date.now();
        this.intensity = options.intensity || 1;
        this.color = options.color || '#ffffff';
        this.active = true;
        return this;
    }

    getProgress() {
        const elapsed = Date.now() - this.startTime;
        return Math.min(1, elapsed / this.duration);
    }

    isComplete() {
        const complete = this.getProgress() >= 1;
        if (complete) this.active = false;
        return complete;
    }

    draw(ctx, canvas) {
        if (!this.active) return;

        const progress = this.getProgress();
        const easeOut = 1 - Math.pow(1 - progress, 3);

        ctx.save();

        switch (this.type) {
            case 'flash':
                ctx.globalAlpha = (1 - easeOut) * 0.3 * this.intensity;
                ctx.fillStyle = this.color;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                break;

            case 'shockwave':
                const radius = easeOut * Math.max(canvas.width, canvas.height) * 0.5;
                const lineWidth = 4 * (1 - easeOut);
                ctx.globalAlpha = (1 - easeOut) * this.intensity;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = lineWidth;
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
        }

        ctx.restore();
    }
}

/**
 * Ball trail system - optimized with fixed-size ring buffer
 */
class BallTrail {
    constructor(maxLength = 8) {
        this.positions = new Array(maxLength);
        this.maxLength = maxLength;
        this.head = 0;
        this.count = 0;
    }

    addPosition(x, y) {
        this.positions[this.head] = { x, y };
        this.head = (this.head + 1) % this.maxLength;
        if (this.count < this.maxLength) this.count++;
    }

    clear() {
        this.head = 0;
        this.count = 0;
    }

    draw(ctx, color = '#00ff88', baseRadius = 8) {
        if (this.count < 2) return;

        ctx.save();
        ctx.fillStyle = color;

        for (let i = 0; i < this.count; i++) {
            const idx = (this.head - this.count + i + this.maxLength) % this.maxLength;
            const pos = this.positions[idx];
            const ratio = (i + 1) / this.count;

            ctx.globalAlpha = ratio * 0.4;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, baseRadius * ratio * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

/**
 * Particle Manager - handles all particle effects with object pooling
 */
export class ParticleManager {
    constructor() {
        // Pre-allocate particle pool
        this.particlePool = new Array(POOL_SIZE);
        for (let i = 0; i < POOL_SIZE; i++) {
            this.particlePool[i] = new Particle();
        }
        this.activeParticleCount = 0;

        // Pre-allocate screen effects pool
        this.screenEffectPool = new Array(MAX_SCREEN_EFFECTS);
        for (let i = 0; i < MAX_SCREEN_EFFECTS; i++) {
            this.screenEffectPool[i] = new ScreenEffect();
        }

        this.ballTrails = new Map();
        this.paddleFlash = 0;
        this.comboGlow = 0;
    }

    /**
     * Get a particle from the pool
     */
    getParticle(x, y, options) {
        // If at max capacity, reuse oldest active particle
        if (this.activeParticleCount >= MAX_PARTICLES) {
            // Find oldest active particle and reuse it
            for (let i = 0; i < POOL_SIZE; i++) {
                if (this.particlePool[i].active) {
                    return this.particlePool[i].reset(x, y, options);
                }
            }
        }

        // Find inactive particle in pool
        for (let i = 0; i < POOL_SIZE; i++) {
            if (!this.particlePool[i].active) {
                this.activeParticleCount++;
                return this.particlePool[i].reset(x, y, options);
            }
        }

        // Pool exhausted, reuse first particle
        return this.particlePool[0].reset(x, y, options);
    }

    /**
     * Get a screen effect from the pool
     */
    getScreenEffect(type, options) {
        for (let i = 0; i < MAX_SCREEN_EFFECTS; i++) {
            if (!this.screenEffectPool[i].active) {
                return this.screenEffectPool[i].reset(type, options);
            }
        }
        // Reuse oldest if all active
        return this.screenEffectPool[0].reset(type, options);
    }

    /**
     * Create brick explosion particles
     */
    explodeBrick(x, y, width, height, color, intensity = 1) {
        // Reduced particle count for performance
        const particleCount = Math.min(12, Math.floor(6 + intensity * 6));
        const cx = x + width / 2;
        const cy = y + height / 2;

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 2 + Math.random() * 3 * intensity;

            this.getParticle(
                cx + (Math.random() - 0.5) * width * 0.5,
                cy + (Math.random() - 0.5) * height * 0.5,
                {
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 2,
                    color: color,
                    size: 2 + Math.random() * 3,
                    type: Math.random() > 0.5 ? 'square' : 'spark',
                    decay: 0.02 + Math.random() * 0.02,
                    gravity: 0.12,
                }
            );
        }
    }

    /**
     * Create powerup collection effect
     */
    collectPowerup(x, y, color, isPositive = true) {
        const particleCount = 10;

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 2 + Math.random() * 2;

            this.getParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: 3 + Math.random() * 3,
                type: 'circle',
                decay: 0.035,
                gravity: isPositive ? -0.08 : 0.15,
            });
        }

        this.getScreenEffect('flash', {
            duration: 150,
            intensity: 0.4,
            color: color,
        });
    }

    /**
     * Create combo milestone effect
     */
    comboMilestone(canvasWidth, canvasHeight, tier) {
        const colors = {
            low: '#ffff00',
            medium: '#ff8800',
            high: '#ff0088',
            epic: '#ff00ff',
        };
        const color = colors[tier] || colors.low;

        this.getScreenEffect('shockwave', {
            duration: 500,
            intensity: tier === 'epic' ? 1.2 : 0.8,
            color: color,
        });

        // Reduced particle count
        const particleCount = tier === 'epic' ? 16 : 8;
        for (let i = 0; i < particleCount; i++) {
            const side = i % 4;
            let x, y, vx, vy;

            switch (side) {
                case 0: x = 0; y = Math.random() * canvasHeight; vx = 4; vy = 0; break;
                case 1: x = canvasWidth; y = Math.random() * canvasHeight; vx = -4; vy = 0; break;
                case 2: x = Math.random() * canvasWidth; y = 0; vx = 0; vy = 4; break;
                case 3: x = Math.random() * canvasWidth; y = canvasHeight; vx = 0; vy = -4; break;
            }

            this.getParticle(x, y, {
                vx: vx + (Math.random() - 0.5) * 2,
                vy: vy + (Math.random() - 0.5) * 2,
                color: color,
                size: 4 + Math.random() * 4,
                type: 'spark',
                decay: 0.015,
                gravity: 0,
            });
        }

        this.comboGlow = 1;
    }

    /**
     * Trigger paddle hit flash
     */
    paddleHit() {
        this.paddleFlash = 1;
    }

    /**
     * Create paddle sparks on ball hit
     */
    paddleSparks(x, y, color = '#00ff88') {
        for (let i = 0; i < 6; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.7;
            const speed = 2 + Math.random() * 3;

            this.getParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: 2 + Math.random() * 2,
                type: 'spark',
                decay: 0.05,
                gravity: 0.2,
            });
        }
    }

    /**
     * Update ball trail
     */
    updateBallTrail(ballId, x, y) {
        if (!this.ballTrails.has(ballId)) {
            this.ballTrails.set(ballId, new BallTrail());
        }
        this.ballTrails.get(ballId).addPosition(x, y);
    }

    /**
     * Remove ball trail
     */
    removeBallTrail(ballId) {
        this.ballTrails.delete(ballId);
    }

    /**
     * Clear all ball trails
     */
    clearBallTrails() {
        this.ballTrails.clear();
    }

    /**
     * Update all particles and effects (in-place, no allocations)
     */
    update() {
        // Update particles in-place
        let activeCount = 0;
        for (let i = 0; i < POOL_SIZE; i++) {
            const p = this.particlePool[i];
            if (p.active) {
                p.update();
                if (p.active) activeCount++;
            }
        }
        this.activeParticleCount = activeCount;

        // Update screen effects
        for (let i = 0; i < MAX_SCREEN_EFFECTS; i++) {
            const e = this.screenEffectPool[i];
            if (e.active) e.isComplete();
        }

        // Decay paddle flash
        if (this.paddleFlash > 0) {
            this.paddleFlash = Math.max(0, this.paddleFlash - 0.1);
        }

        // Decay combo glow
        if (this.comboGlow > 0) {
            this.comboGlow = Math.max(0, this.comboGlow - 0.02);
        }
    }

    /**
     * Draw all particles - batched by type for performance
     */
    drawParticles(ctx) {
        ctx.save();

        // Draw squares
        for (let i = 0; i < POOL_SIZE; i++) {
            const p = this.particlePool[i];
            if (p.active && p.type === 'square') {
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            }
        }

        // Draw circles
        for (let i = 0; i < POOL_SIZE; i++) {
            const p = this.particlePool[i];
            if (p.active && p.type === 'circle') {
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw sparks
        ctx.lineWidth = 2;
        for (let i = 0; i < POOL_SIZE; i++) {
            const p = this.particlePool[i];
            if (p.active && p.type === 'spark') {
                ctx.globalAlpha = p.alpha;
                ctx.strokeStyle = p.color;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.beginPath();
                ctx.moveTo(-p.size, 0);
                ctx.lineTo(p.size, 0);
                ctx.moveTo(0, -p.size);
                ctx.lineTo(0, p.size);
                ctx.stroke();
                ctx.restore();
            }
        }

        ctx.restore();
    }

    /**
     * Draw ball trails
     */
    drawBallTrails(ctx, balls, levelColor = '#00ff88') {
        this.ballTrails.forEach((trail, ballId) => {
            const ball = balls.find(b => b.id === ballId);
            if (ball) {
                trail.draw(ctx, ball.fireball ? '#ff4400' : levelColor, ball.radius);
            }
        });
    }

    /**
     * Draw screen effects
     */
    drawScreenEffects(ctx, canvas) {
        for (let i = 0; i < MAX_SCREEN_EFFECTS; i++) {
            const e = this.screenEffectPool[i];
            if (e.active) e.draw(ctx, canvas);
        }
    }

    /**
     * Get paddle flash intensity
     */
    getPaddleFlashIntensity() {
        return this.paddleFlash;
    }

    /**
     * Get combo glow intensity
     */
    getComboGlow() {
        return this.comboGlow;
    }

    /**
     * Clear all effects
     */
    clear() {
        for (let i = 0; i < POOL_SIZE; i++) {
            this.particlePool[i].active = false;
        }
        for (let i = 0; i < MAX_SCREEN_EFFECTS; i++) {
            this.screenEffectPool[i].active = false;
        }
        this.ballTrails.clear();
        this.activeParticleCount = 0;
        this.paddleFlash = 0;
        this.comboGlow = 0;
    }

    /**
     * Get particle count (for debugging)
     */
    getParticleCount() {
        return this.activeParticleCount;
    }
}

/**
 * Create a new particle manager
 * @returns {ParticleManager}
 */
export function createParticleManager() {
    return new ParticleManager();
}
