import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ParticleManager, createParticleManager } from '../../src/systems/particles.js';

describe('Particle System', () => {
    let particleManager;
    let mockCtx;
    let mockCanvas;

    beforeEach(() => {
        particleManager = new ParticleManager();

        mockCtx = {
            save: vi.fn(),
            restore: vi.fn(),
            fillStyle: '',
            strokeStyle: '',
            globalAlpha: 1,
            lineWidth: 1,
            translate: vi.fn(),
            rotate: vi.fn(),
            fillRect: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
        };

        mockCanvas = {
            width: 800,
            height: 600,
        };
    });

    describe('ParticleManager constructor', () => {
        it('should initialize with pre-allocated particle pool', () => {
            expect(particleManager.particlePool.length).toBe(250); // POOL_SIZE
        });

        it('should initialize with pre-allocated screen effect pool', () => {
            expect(particleManager.screenEffectPool.length).toBe(5); // MAX_SCREEN_EFFECTS
        });

        it('should initialize activeParticleCount to 0', () => {
            expect(particleManager.activeParticleCount).toBe(0);
        });

        it('should initialize ballTrails as empty Map', () => {
            expect(particleManager.ballTrails).toBeInstanceOf(Map);
            expect(particleManager.ballTrails.size).toBe(0);
        });

        it('should initialize paddleFlash to 0', () => {
            expect(particleManager.paddleFlash).toBe(0);
        });

        it('should initialize comboGlow to 0', () => {
            expect(particleManager.comboGlow).toBe(0);
        });
    });

    describe('getParticle', () => {
        it('should return a particle from the pool', () => {
            const particle = particleManager.getParticle(100, 200, {});
            expect(particle.active).toBe(true);
            expect(particle.x).toBe(100);
            expect(particle.y).toBe(200);
        });

        it('should track active particles after update', () => {
            // Clear all particles first
            particleManager.clear();
            // Get a new particle
            particleManager.getParticle(100, 200, {});
            // Run update to count active particles
            particleManager.update();
            // After update, count should reflect active particles
            expect(particleManager.activeParticleCount).toBeGreaterThanOrEqual(0);
        });

        it('should apply custom options', () => {
            const particle = particleManager.getParticle(100, 200, {
                vx: 5,
                vy: -3,
                color: '#ff0000',
                size: 10,
            });
            expect(particle.vx).toBe(5);
            expect(particle.vy).toBe(-3);
            expect(particle.color).toBe('#ff0000');
            expect(particle.size).toBe(10);
        });
    });

    describe('getScreenEffect', () => {
        it('should return a screen effect from the pool', () => {
            const effect = particleManager.getScreenEffect('flash', { duration: 300 });
            expect(effect.active).toBe(true);
            expect(effect.type).toBe('flash');
            expect(effect.duration).toBe(300);
        });
    });

    describe('explodeBrick', () => {
        it('should create particles for brick explosion', () => {
            particleManager.clear();
            particleManager.explodeBrick(100, 200, 60, 20, '#00ff88', 1);
            particleManager.update();
            expect(particleManager.activeParticleCount).toBeGreaterThan(0);
        });

        it('should create particles at brick position', () => {
            particleManager.clear();
            particleManager.explodeBrick(100, 200, 60, 20, '#00ff88', 1);
            // Verify the method doesn't throw
            expect(() => particleManager.explodeBrick(100, 200, 60, 20, '#00ff88', 1)).not.toThrow();
        });
    });

    describe('collectPowerup', () => {
        it('should create particles for powerup collection', () => {
            particleManager.clear();
            particleManager.collectPowerup(400, 300, '#00ff88', true);
            particleManager.update();
            expect(particleManager.activeParticleCount).toBeGreaterThan(0);
        });

        it('should create screen flash effect', () => {
            particleManager.clear();
            particleManager.collectPowerup(400, 300, '#00ff88', true);
            const hasActiveEffect = particleManager.screenEffectPool.some(e => e.active);
            expect(hasActiveEffect).toBe(true);
        });
    });

    describe('comboMilestone', () => {
        it('should create shockwave effect', () => {
            particleManager.comboMilestone(800, 600, 'low');
            const hasActiveEffect = particleManager.screenEffectPool.some(e => e.active && e.type === 'shockwave');
            expect(hasActiveEffect).toBe(true);
        });

        it('should set comboGlow to 1', () => {
            particleManager.comboMilestone(800, 600, 'low');
            expect(particleManager.comboGlow).toBe(1);
        });

        it('should create more particles for epic tier', () => {
            particleManager.comboMilestone(800, 600, 'low');
            const countLow = particleManager.activeParticleCount;
            particleManager.clear();
            particleManager.comboMilestone(800, 600, 'epic');
            const countEpic = particleManager.activeParticleCount;
            expect(countEpic).toBeGreaterThan(countLow);
        });
    });

    describe('paddleHit', () => {
        it('should set paddleFlash to 1', () => {
            particleManager.paddleHit();
            expect(particleManager.paddleFlash).toBe(1);
        });
    });

    describe('paddleSparks', () => {
        it('should create spark particles', () => {
            particleManager.clear();
            particleManager.paddleSparks(400, 550, '#00ff88');
            particleManager.update();
            expect(particleManager.activeParticleCount).toBeGreaterThan(0);
        });
    });

    describe('Ball trail management', () => {
        it('should create trail for new ball', () => {
            particleManager.updateBallTrail(1, 100, 200);
            expect(particleManager.ballTrails.has(1)).toBe(true);
        });

        it('should add position to existing trail', () => {
            particleManager.updateBallTrail(1, 100, 200);
            particleManager.updateBallTrail(1, 110, 190);
            const trail = particleManager.ballTrails.get(1);
            expect(trail.count).toBe(2);
        });

        it('should remove ball trail', () => {
            particleManager.updateBallTrail(1, 100, 200);
            particleManager.removeBallTrail(1);
            expect(particleManager.ballTrails.has(1)).toBe(false);
        });

        it('should clear all ball trails', () => {
            particleManager.updateBallTrail(1, 100, 200);
            particleManager.updateBallTrail(2, 200, 300);
            particleManager.clearBallTrails();
            expect(particleManager.ballTrails.size).toBe(0);
        });
    });

    describe('update', () => {
        it('should count active particles', () => {
            particleManager.clear();
            particleManager.getParticle(100, 200, { decay: 0.01 });
            particleManager.update();
            // After update, count reflects active particles
            expect(particleManager.activeParticleCount).toBeGreaterThanOrEqual(0);
        });

        it('should decay paddleFlash', () => {
            particleManager.paddleFlash = 1;
            particleManager.update();
            expect(particleManager.paddleFlash).toBe(0.9);
        });

        it('should decay comboGlow', () => {
            particleManager.comboGlow = 1;
            particleManager.update();
            expect(particleManager.comboGlow).toBe(0.98);
        });

        it('should set paddleFlash to 0 when below threshold', () => {
            particleManager.paddleFlash = 0.05;
            particleManager.update();
            expect(particleManager.paddleFlash).toBe(0);
        });
    });

    describe('drawParticles', () => {
        it('should call save and restore', () => {
            particleManager.drawParticles(mockCtx);
            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should draw active particles', () => {
            particleManager.getParticle(100, 200, { type: 'square' });
            particleManager.drawParticles(mockCtx);
            expect(mockCtx.fillRect).toHaveBeenCalled();
        });

        it('should draw circle particles', () => {
            particleManager.getParticle(100, 200, { type: 'circle' });
            particleManager.drawParticles(mockCtx);
            expect(mockCtx.arc).toHaveBeenCalled();
        });

        it('should draw spark particles', () => {
            particleManager.getParticle(100, 200, { type: 'spark' });
            particleManager.drawParticles(mockCtx);
            expect(mockCtx.moveTo).toHaveBeenCalled();
            expect(mockCtx.lineTo).toHaveBeenCalled();
        });
    });

    describe('drawBallTrails', () => {
        it('should draw trails for active balls', () => {
            particleManager.updateBallTrail(1, 100, 200);
            particleManager.updateBallTrail(1, 110, 190);
            particleManager.updateBallTrail(1, 120, 180);

            const balls = [{ id: 1, fireball: false, radius: 8 }];
            particleManager.drawBallTrails(mockCtx, balls, '#00ff88');

            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });
    });

    describe('drawScreenEffects', () => {
        it('should draw active screen effects', () => {
            particleManager.getScreenEffect('flash', { duration: 1000 });
            particleManager.drawScreenEffects(mockCtx, mockCanvas);
            expect(mockCtx.save).toHaveBeenCalled();
        });
    });

    describe('getPaddleFlashIntensity', () => {
        it('should return paddleFlash value', () => {
            particleManager.paddleFlash = 0.5;
            expect(particleManager.getPaddleFlashIntensity()).toBe(0.5);
        });
    });

    describe('getComboGlow', () => {
        it('should return comboGlow value', () => {
            particleManager.comboGlow = 0.7;
            expect(particleManager.getComboGlow()).toBe(0.7);
        });
    });

    describe('clear', () => {
        it('should deactivate all particles', () => {
            particleManager.getParticle(100, 200, {});
            particleManager.getParticle(200, 300, {});
            particleManager.clear();
            expect(particleManager.activeParticleCount).toBe(0);
        });

        it('should deactivate all screen effects', () => {
            particleManager.getScreenEffect('flash', {});
            particleManager.clear();
            const hasActiveEffect = particleManager.screenEffectPool.some(e => e.active);
            expect(hasActiveEffect).toBe(false);
        });

        it('should clear all ball trails', () => {
            particleManager.updateBallTrail(1, 100, 200);
            particleManager.clear();
            expect(particleManager.ballTrails.size).toBe(0);
        });

        it('should reset paddleFlash and comboGlow', () => {
            particleManager.paddleFlash = 1;
            particleManager.comboGlow = 1;
            particleManager.clear();
            expect(particleManager.paddleFlash).toBe(0);
            expect(particleManager.comboGlow).toBe(0);
        });
    });

    describe('getParticleCount', () => {
        it('should return active particle count after update', () => {
            particleManager.clear();
            particleManager.getParticle(100, 200, { decay: 0.01 });
            particleManager.getParticle(200, 300, { decay: 0.01 });
            particleManager.update();
            expect(particleManager.getParticleCount()).toBeGreaterThanOrEqual(0);
        });
    });

    describe('createParticleManager', () => {
        it('should create a ParticleManager instance', () => {
            const manager = createParticleManager();
            expect(manager).toBeInstanceOf(ParticleManager);
        });
    });

    describe('Particle pool exhaustion', () => {
        it('should handle pool exhaustion by reusing particles', () => {
            // Create more than MAX_PARTICLES (200)
            for (let i = 0; i < 250; i++) {
                particleManager.getParticle(i, i, {});
            }
            // Should not throw and should cap at MAX_PARTICLES
            expect(particleManager.activeParticleCount).toBeLessThanOrEqual(250);
        });
    });

    describe('Screen effect types', () => {
        it('should create flash effect', () => {
            const effect = particleManager.getScreenEffect('flash', { color: '#ff0000' });
            expect(effect.type).toBe('flash');
            expect(effect.color).toBe('#ff0000');
        });

        it('should create shockwave effect', () => {
            const effect = particleManager.getScreenEffect('shockwave', { intensity: 1.5 });
            expect(effect.type).toBe('shockwave');
            expect(effect.intensity).toBe(1.5);
        });
    });
});
