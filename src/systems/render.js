// CODEBREAKOUT - Render System
// ============================================================================
// All rendering functions
// ============================================================================

import { CONFIG } from '../config.js';

// Polyfill for roundRect (Safari < 16 compatibility)
if (typeof CanvasRenderingContext2D !== 'undefined' &&
    !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radii) {
        // Normalize radii to array format
        let r;
        if (typeof radii === 'undefined') {
            r = [0, 0, 0, 0];
        } else if (typeof radii === 'number') {
            r = [radii, radii, radii, radii];
        } else if (Array.isArray(radii)) {
            if (radii.length === 1) r = [radii[0], radii[0], radii[0], radii[0]];
            else if (radii.length === 2) r = [radii[0], radii[1], radii[0], radii[1]];
            else if (radii.length === 3) r = [radii[0], radii[1], radii[2], radii[1]];
            else r = radii.slice(0, 4);
        } else {
            r = [0, 0, 0, 0];
        }

        // Clamp radii to half of smallest dimension
        const maxRadius = Math.min(width, height) / 2;
        r = r.map(radius => Math.min(radius, maxRadius));

        // Draw rounded rectangle path
        this.moveTo(x + r[0], y);
        this.lineTo(x + width - r[1], y);
        this.arcTo(x + width, y, x + width, y + r[1], r[1]);
        this.lineTo(x + width, y + height - r[2]);
        this.arcTo(x + width, y + height, x + width - r[2], y + height, r[2]);
        this.lineTo(x + r[3], y + height);
        this.arcTo(x, y + height, x, y + height - r[3], r[3]);
        this.lineTo(x, y + r[0]);
        this.arcTo(x, y, x + r[0], y, r[0]);
        this.closePath();

        return this;
    };
}
import { POWERUP_TYPES } from '../powerups.js';

// Animation time for animated effects
let animationTime = 0;

// Current theme style (set by setThemeStyle)
let currentThemeStyle = {
    brickStyle: 'angular',
    brickBorderRadius: 3,
    brickBorderWidth: 2,
    brickGlow: true,
    brickPattern: 'grid',
    paddleStyle: 'tech',
    ballGlow: true,
    particleStyle: 'pixels',
};

/**
 * Set the current theme style for rendering
 * @param {object} style - Theme style object
 */
export function setThemeStyle(style) {
    if (style) {
        currentThemeStyle = { ...currentThemeStyle, ...style };
    }
}

/**
 * Update animation time - call this each frame
 */
export function updateAnimationTime() {
    animationTime = Date.now() / 1000;
}

/**
 * Adjust color alpha value
 * @param {string} color - Hex color string
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 */
export function adjustAlpha(color, alpha) {
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }
    return color;
}

/**
 * Clear the canvas
 * @param {CanvasRenderingContext2D} ctx
 */
export function clearCanvas(ctx) {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
}

/**
 * Draw background with level-themed vignette and grid
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} levelData - Current level configuration
 */
export function drawBackground(ctx, levelData) {
    // Subtle level-colored vignette
    const gradient = ctx.createRadialGradient(
        CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, 0,
        CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, CONFIG.CANVAS_WIDTH
    );
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, adjustAlpha(levelData.color, 0.05));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;

    for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CONFIG.CANVAS_HEIGHT);
        ctx.stroke();
    }

    for (let y = 0; y < CONFIG.CANVAS_HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CONFIG.CANVAS_WIDTH, y);
        ctx.stroke();
    }
}

// ============================================================================
// BRICK RENDERING HELPERS
// ============================================================================

/**
 * Parse hex color to RGB components
 * @param {string} color - Hex color string
 * @returns {{r: number, g: number, b: number}}
 */
function hexToRgb(color) {
    if (!color || !color.startsWith('#')) return { r: 128, g: 128, b: 128 };
    return {
        r: parseInt(color.slice(1, 3), 16),
        g: parseInt(color.slice(3, 5), 16),
        b: parseInt(color.slice(5, 7), 16)
    };
}

/**
 * Darken a hex color
 * @param {string} color - Hex color string
 * @param {number} factor - Darkening factor (0-1)
 * @returns {string}
 */
function darkenColor(color, factor) {
    const rgb = hexToRgb(color);
    const r = Math.floor(rgb.r * (1 - factor));
    const g = Math.floor(rgb.g * (1 - factor));
    const b = Math.floor(rgb.b * (1 - factor));
    return `rgb(${r},${g},${b})`;
}

/**
 * Lighten a hex color
 * @param {string} color - Hex color string
 * @param {number} factor - Lightening factor (0-1)
 * @returns {string}
 */
function lightenColor(color, factor) {
    const rgb = hexToRgb(color);
    const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * factor));
    const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * factor));
    const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * factor));
    return `rgb(${r},${g},${b})`;
}

/**
 * Draw a gradient-filled brick
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Brick width
 * @param {number} height - Brick height
 * @param {string} color1 - Top color
 * @param {string} color2 - Bottom color
 */
function drawGradientBrick(ctx, x, y, width, height, color1, color2) {
    const style = currentThemeStyle.brickStyle || 'angular';

    switch (style) {
        case 'angular':
            drawAngularBrick(ctx, x, y, width, height, color1, color2);
            break;
        case 'rounded':
            drawRoundedBrick(ctx, x, y, width, height, color1, color2);
            break;
        case 'space':
            drawSpaceBrick(ctx, x, y, width, height, color1, color2);
            break;
        default:
            drawAngularBrick(ctx, x, y, width, height, color1, color2);
    }
}

/**
 * Draw CODE theme brick - angular, tech-style with circuit patterns
 */
function drawAngularBrick(ctx, x, y, width, height, color1, color2) {
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    // Add glow
    ctx.shadowColor = color1;
    ctx.shadowBlur = 6;

    // Main brick with small corner cuts for angular look
    const cut = 4;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x + cut, y);
    ctx.lineTo(x + width - cut, y);
    ctx.lineTo(x + width, y + cut);
    ctx.lineTo(x + width, y + height - cut);
    ctx.lineTo(x + width - cut, y + height);
    ctx.lineTo(x + cut, y + height);
    ctx.lineTo(x, y + height - cut);
    ctx.lineTo(x, y + cut);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    // Circuit line pattern
    ctx.strokeStyle = 'rgba(0,255,136,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Horizontal line
    ctx.moveTo(x + 5, y + height / 2);
    ctx.lineTo(x + width - 5, y + height / 2);
    // Small node
    ctx.moveTo(x + width * 0.7, y + height / 2);
    ctx.lineTo(x + width * 0.7, y + height * 0.3);
    ctx.stroke();

    // Corner accent
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(x, y + cut);
    ctx.lineTo(x + cut, y);
    ctx.lineTo(x + 12, y);
    ctx.lineTo(x, y + 12);
    ctx.closePath();
    ctx.fill();
}

/**
 * Draw CAKE theme brick - soft, pastry-like with frosting
 */
function drawRoundedBrick(ctx, x, y, width, height, color1, color2) {
    const radius = 10;

    // Shadow for depth
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    // Main pastry body
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.5, color2);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Frosting on top
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + 4, width * 0.4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Frosting drips
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    const drips = [0.25, 0.5, 0.75];
    for (const d of drips) {
        const dx = x + width * d;
        const dh = 4 + Math.sin(dx) * 3;
        ctx.beginPath();
        ctx.ellipse(dx, y + dh + 2, 3, dh, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Sprinkle dots
    ctx.fillStyle = '#ff69b4';
    for (let i = 0; i < 3; i++) {
        const sx = x + 8 + i * (width - 16) / 2;
        const sy = y + height * 0.6 + Math.sin(sx) * 3;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Subtle inner highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 3, width - 6, height - 6, radius - 2);
    ctx.stroke();
}

/**
 * Draw ASTRO theme brick - planetary/space style with glow
 */
function drawSpaceBrick(ctx, x, y, width, height, color1, color2) {
    const radius = 8;

    // Outer glow (subtle)
    ctx.shadowColor = color1;
    ctx.shadowBlur = 5;

    // Main brick with subtle oval shape
    const gradient = ctx.createRadialGradient(
        x + width * 0.3, y + height * 0.3, 0,
        x + width / 2, y + height / 2, width * 0.7
    );
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.7, color2);
    gradient.addColorStop(1, 'rgba(0,0,0,0.3)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Planetary ring effect
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height / 2, width * 0.45, height * 0.2, 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // Star sparkles
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    const pulse = 0.5 + Math.sin(animationTime * 3 + x) * 0.5;
    drawStar(ctx, x + width * 0.8, y + height * 0.25, 2 * pulse, 1 * pulse);
    drawStar(ctx, x + width * 0.2, y + height * 0.7, 1.5 * pulse, 0.7 * pulse);

    // Atmosphere highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.ellipse(x + width * 0.35, y + height * 0.35, width * 0.25, height * 0.2, -0.5, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Draw a small star shape
 */
function drawStar(ctx, cx, cy, outerR, innerR) {
    const spikes = 4;
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
}

/**
 * Draw cracks on a brick based on damage level
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Brick width
 * @param {number} height - Brick height
 * @param {number} damage - Damage level (1 = small cracks, 2 = large cracks)
 */
function drawCracks(ctx, x, y, width, height, damage) {
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.lineWidth = 2;

    if (damage >= 1) {
        // Small cracks
        ctx.beginPath();
        ctx.moveTo(x + width * 0.3, y);
        ctx.lineTo(x + width * 0.4, y + height * 0.4);
        ctx.lineTo(x + width * 0.35, y + height * 0.6);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + width * 0.7, y + height);
        ctx.lineTo(x + width * 0.6, y + height * 0.5);
        ctx.stroke();
    }

    if (damage >= 2) {
        // Large cracks
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + width * 0.5, y);
        ctx.lineTo(x + width * 0.45, y + height * 0.3);
        ctx.lineTo(x + width * 0.55, y + height * 0.5);
        ctx.lineTo(x + width * 0.4, y + height * 0.7);
        ctx.lineTo(x + width * 0.5, y + height);
        ctx.stroke();

        // Additional crack branches
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + width * 0.45, y + height * 0.3);
        ctx.lineTo(x + width * 0.2, y + height * 0.4);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + width * 0.55, y + height * 0.5);
        ctx.lineTo(x + width * 0.8, y + height * 0.55);
        ctx.stroke();
    }

    // Add light crack highlights
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    if (damage >= 1) {
        ctx.beginPath();
        ctx.moveTo(x + width * 0.31, y + 1);
        ctx.lineTo(x + width * 0.41, y + height * 0.4);
        ctx.stroke();
    }
}

/**
 * Draw diagonal line pattern
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Brick width
 * @param {number} height - Brick height
 * @param {string} color - Pattern color
 */
function drawDiagonalPattern(ctx, x, y, width, height, color) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;

    const spacing = 8;
    for (let i = -height; i < width + height; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i + height, y + height);
        ctx.stroke();
    }
    ctx.restore();
}

/**
 * Draw cross-hatch pattern for unbreakable bricks
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Brick width
 * @param {number} height - Brick height
 */
function drawCrossHatchPattern(ctx, x, y, width, height) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;

    const spacing = 6;
    // Diagonal lines one direction
    for (let i = -height; i < width + height; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i + height, y + height);
        ctx.stroke();
    }
    // Diagonal lines other direction
    for (let i = -height; i < width + height; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(x + i + height, y);
        ctx.lineTo(x + i, y + height);
        ctx.stroke();
    }
    ctx.restore();
}

/**
 * Draw warning stripes for hazard bricks
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Brick width
 * @param {number} height - Brick height
 */
function drawWarningStripes(ctx, x, y, width, height) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    const stripeWidth = 10;
    for (let i = -height; i < width + height; i += stripeWidth * 2) {
        ctx.beginPath();
        ctx.moveTo(x + i, y + height);
        ctx.lineTo(x + i + stripeWidth, y + height);
        ctx.lineTo(x + i + stripeWidth + height, y);
        ctx.lineTo(x + i + height, y);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
}

/**
 * Draw metallic shine effect
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Brick width
 * @param {number} height - Brick height
 */
function drawShineEffect(ctx, x, y, width, height) {
    const gradient = ctx.createLinearGradient(x, y, x + width * 0.7, y + height * 0.3);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.4)');
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height * 0.5);
}

/**
 * Draw a pulsing glow effect
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Brick width
 * @param {number} height - Brick height
 * @param {string} color - Glow color
 * @param {number} intensity - Base intensity (0-1)
 */
function drawPulsingGlow(ctx, x, y, width, height, color, intensity) {
    const pulse = 0.5 + 0.5 * Math.sin(animationTime * 4);
    const glowAlpha = intensity * (0.3 + 0.4 * pulse);

    ctx.shadowColor = color;
    ctx.shadowBlur = 10 + 8 * pulse;
    ctx.fillStyle = adjustAlpha(color, glowAlpha);
    ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
    ctx.shadowBlur = 0;
}

/**
 * Draw swirling portal effect
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Brick width
 * @param {number} height - Brick height
 */
function drawPortalEffect(ctx, x, y, width, height) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) * 0.4;

    // Animated swirl
    const angle = animationTime * 2;

    // Outer glow
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
    glowGradient.addColorStop(0, 'rgba(153,0,255,0.8)');
    glowGradient.addColorStop(0.5, 'rgba(153,0,255,0.4)');
    glowGradient.addColorStop(1, 'rgba(153,0,255,0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(x, y, width, height);

    // Swirl lines
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    for (let i = 0; i < 3; i++) {
        const spiralAngle = angle + (i * Math.PI * 2 / 3);
        ctx.strokeStyle = `rgba(255,255,255,${0.5 - i * 0.1})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let t = 0; t < Math.PI * 2; t += 0.1) {
            const r = radius * (t / (Math.PI * 2));
            const px = centerX + Math.cos(spiralAngle + t) * r;
            const py = centerY + Math.sin(spiralAngle + t) * r;
            if (t === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
    ctx.restore();

    // Center bright spot
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3 + Math.sin(animationTime * 6) * 2, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Draw explosion/spark effect for exploding bricks
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Brick width
 * @param {number} height - Brick height
 */
function drawExplosionEffect(ctx, x, y, width, height) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Animated sparks
    const sparkCount = 4;
    for (let i = 0; i < sparkCount; i++) {
        const sparkAngle = (animationTime * 3 + i * Math.PI / 2) % (Math.PI * 2);
        const sparkDist = 8 + 4 * Math.sin(animationTime * 8 + i);
        const sparkX = centerX + Math.cos(sparkAngle) * sparkDist;
        const sparkY = centerY + Math.sin(sparkAngle) * sparkDist;

        // Spark glow
        const sparkGradient = ctx.createRadialGradient(sparkX, sparkY, 0, sparkX, sparkY, 4);
        sparkGradient.addColorStop(0, 'rgba(255,255,0,0.8)');
        sparkGradient.addColorStop(1, 'rgba(255,100,0,0)');
        ctx.fillStyle = sparkGradient;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Center flame icon
    ctx.fillStyle = 'rgba(255,255,0,0.9)';
    ctx.font = 'bold 12px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('*', centerX, centerY);
}

// ============================================================================
// MAIN BRICK DRAWING FUNCTION
// ============================================================================

/**
 * Draw all bricks with type-specific visual effects
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} bricks - Array of brick objects
 */
export function drawBricks(ctx, bricks) {
    // Update animation time
    updateAnimationTime();

    for (const brick of bricks) {
        // Skip destroyed bricks (for bonus level regeneration)
        if (brick.destroyed) continue;

        const { x, y, width, height, color, type, hits, maxHits } = brick;
        const hitsRemaining = hits;

        switch (type) {
            case 'STANDARD':
                drawStandardBrick(ctx, x, y, width, height, color);
                break;

            case 'STRONG':
                drawStrongBrick(ctx, x, y, width, height, color, hitsRemaining, maxHits);
                break;

            case 'TOUGH':
                drawToughBrick(ctx, x, y, width, height, color, hitsRemaining, maxHits);
                break;

            case 'UNBREAKABLE':
                drawUnbreakableBrick(ctx, x, y, width, height);
                break;

            case 'HAZARD':
                drawHazardBrick(ctx, x, y, width, height, color);
                break;

            case 'EXPLODING':
                drawExplodingBrick(ctx, x, y, width, height, color);
                break;

            case 'PORTAL':
                drawPortalBrick(ctx, x, y, width, height, color);
                break;

            default:
                drawStandardBrick(ctx, x, y, width, height, color);
        }
    }
}

/**
 * Draw reflection highlight on top edge of brick
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Brick width
 * @param {number} height - Brick height
 */
function drawReflectionHighlight(ctx, x, y, width, height) {
    const reflectionGradient = ctx.createLinearGradient(x, y, x, y + height * 0.4);
    reflectionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    reflectionGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = reflectionGradient;
    ctx.fillRect(x + 2, y + 2, width - 4, height * 0.4);
}

/**
 * Draw a standard single-hit brick
 */
function drawStandardBrick(ctx, x, y, width, height, color) {
    // Simple gradient fill
    const lightColor = lightenColor(color, 0.2);
    const darkColor = darkenColor(color, 0.2);
    drawGradientBrick(ctx, x, y, width, height, lightColor, darkColor);

    // Subtle inner highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + height - 2);
    ctx.lineTo(x + 2, y + 2);
    ctx.lineTo(x + width - 2, y + 2);
    ctx.stroke();

    // Subtle border
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    // Reflection highlight
    drawReflectionHighlight(ctx, x, y, width, height);
}

/**
 * Draw a strong 2-hit brick
 */
function drawStrongBrick(ctx, x, y, width, height, color, hitsRemaining, maxHits) {
    // Darker, more saturated base
    const darkColor = darkenColor(color, 0.3);
    const darkerColor = darkenColor(color, 0.5);
    drawGradientBrick(ctx, x, y, width, height, darkColor, darkerColor);

    // Add diagonal line pattern
    drawDiagonalPattern(ctx, x, y, width, height, 'rgba(255,255,255,0.15)');

    // Show damage
    if (hitsRemaining === 1) {
        drawCracks(ctx, x, y, width, height, 1);
    }

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);

    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    // Reflection highlight
    drawReflectionHighlight(ctx, x, y, width, height);
}

/**
 * Draw a tough 3-hit brick with metallic look
 */
function drawToughBrick(ctx, x, y, width, height, color, hitsRemaining, maxHits) {
    // Metallic gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, lightenColor(color, 0.4));
    gradient.addColorStop(0.3, color);
    gradient.addColorStop(0.5, darkenColor(color, 0.2));
    gradient.addColorStop(0.7, color);
    gradient.addColorStop(1, darkenColor(color, 0.4));
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    // Shine effect
    drawShineEffect(ctx, x, y, width, height);

    // Show progressive damage
    const damage = maxHits - hitsRemaining;
    if (damage >= 1) {
        drawCracks(ctx, x, y, width, height, damage);
    }

    // Metallic border
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 1, y + height - 1);
    ctx.lineTo(x + 1, y + 1);
    ctx.lineTo(x + width - 1, y + 1);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + width - 1, y + 1);
    ctx.lineTo(x + width - 1, y + height - 1);
    ctx.lineTo(x + 1, y + height - 1);
    ctx.stroke();

    // Reflection highlight
    drawReflectionHighlight(ctx, x, y, width, height);
}

/**
 * Draw an unbreakable steel brick
 */
function drawUnbreakableBrick(ctx, x, y, width, height) {
    // Steel metallic gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, '#666666');
    gradient.addColorStop(0.2, '#444444');
    gradient.addColorStop(0.5, '#555555');
    gradient.addColorStop(0.8, '#333333');
    gradient.addColorStop(1, '#222222');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    // Cross-hatch pattern
    drawCrossHatchPattern(ctx, x, y, width, height);

    // Steel shine
    const shineGradient = ctx.createLinearGradient(x, y, x + width * 0.5, y + height * 0.3);
    shineGradient.addColorStop(0, 'rgba(255,255,255,0)');
    shineGradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    shineGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shineGradient;
    ctx.fillRect(x, y, width, height * 0.4);

    // Bolt/rivet details in corners
    const rivetRadius = 3;
    ctx.fillStyle = '#555555';
    const rivetPositions = [
        [x + 6, y + height / 2],
        [x + width - 6, y + height / 2]
    ];
    for (const [rx, ry] of rivetPositions) {
        ctx.beginPath();
        ctx.arc(rx, ry, rivetRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Heavy border
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Reflection highlight
    drawReflectionHighlight(ctx, x, y, width, height);
}

/**
 * Draw a hazard brick with warning effects
 */
function drawHazardBrick(ctx, x, y, width, height, color) {
    // Pulsing glow
    drawPulsingGlow(ctx, x, y, width, height, color, 0.6);

    // Base gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, darkenColor(color, 0.2));
    gradient.addColorStop(1, darkenColor(color, 0.4));
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    // Warning stripes
    drawWarningStripes(ctx, x, y, width, height);

    // Skull/warning icon
    const pulse = 0.7 + 0.3 * Math.sin(animationTime * 5);
    ctx.fillStyle = `rgba(255,255,255,${pulse})`;
    ctx.font = 'bold 12px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', x + width / 2, y + height / 2);

    // Glowing border
    ctx.strokeStyle = adjustAlpha(color, 0.8);
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Reflection highlight
    drawReflectionHighlight(ctx, x, y, width, height);
}

/**
 * Draw an exploding brick with fire effects
 */
function drawExplodingBrick(ctx, x, y, width, height, color) {
    // Outer glow
    const glowPulse = 0.5 + 0.5 * Math.sin(animationTime * 6);
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 8 + 6 * glowPulse;

    // Orange/red gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, '#ffaa00');
    gradient.addColorStop(0.3, '#ff6600');
    gradient.addColorStop(0.7, '#ff3300');
    gradient.addColorStop(1, '#cc0000');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    ctx.shadowBlur = 0;

    // Inner fire texture
    const innerGradient = ctx.createRadialGradient(
        x + width / 2, y + height / 2, 0,
        x + width / 2, y + height / 2, width / 2
    );
    innerGradient.addColorStop(0, 'rgba(255,255,0,0.4)');
    innerGradient.addColorStop(0.5, 'rgba(255,100,0,0.2)');
    innerGradient.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = innerGradient;
    ctx.fillRect(x, y, width, height);

    // Spark effects
    drawExplosionEffect(ctx, x, y, width, height);

    // Border
    ctx.strokeStyle = 'rgba(255,200,0,0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Reflection highlight
    drawReflectionHighlight(ctx, x, y, width, height);
}

/**
 * Draw a portal brick with mystical swirl
 */
function drawPortalBrick(ctx, x, y, width, height, color) {
    // Dark mystical base
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    const hue1 = (animationTime * 30) % 360;
    const hue2 = (hue1 + 60) % 360;
    gradient.addColorStop(0, `hsl(${hue1}, 80%, 30%)`);
    gradient.addColorStop(0.5, `hsl(${270}, 80%, 25%)`);
    gradient.addColorStop(1, `hsl(${hue2}, 80%, 30%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    // Swirling portal effect
    drawPortalEffect(ctx, x, y, width, height);

    // Mystical glow border
    const glowPulse = 0.6 + 0.4 * Math.sin(animationTime * 3);
    ctx.strokeStyle = `rgba(180,100,255,${glowPulse})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Outer glow
    ctx.shadowColor = '#9900ff';
    ctx.shadowBlur = 10 * glowPulse;
    ctx.strokeStyle = 'rgba(153,0,255,0.5)';
    ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);
    ctx.shadowBlur = 0;

    // Reflection highlight
    drawReflectionHighlight(ctx, x, y, width, height);
}

/**
 * Draw paddle with modern cyberpunk/neon style
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} paddle - Paddle object
 * @param {object} levelData - Current level configuration
 * @param {object} activePowerups - Active powerups state
 * @param {object} cosmetic - Optional cosmetic customization
 */
export function drawPaddle(ctx, paddle, levelData, activePowerups, cosmetic = null) {
    const { x, y, width, height } = paddle;
    const w = width;
    const h = height;
    const paddleStyle = currentThemeStyle.paddleStyle || 'tech';

    // Use theme-specific corner radius
    let cornerRadius = 4;
    if (paddleStyle === 'candy') cornerRadius = 10;
    else if (paddleStyle === 'spaceship') cornerRadius = 2;

    ctx.save();

    // Determine paddle color based on cosmetic
    let paddleColor = levelData.color;
    let glowColor = levelData.color;

    if (cosmetic) {
        if (cosmetic.rainbow) {
            // Rainbow effect - cycle through colors
            const hue = (Date.now() / 20) % 360;
            paddleColor = `hsl(${hue}, 100%, 50%)`;
            glowColor = paddleColor;
        } else if (cosmetic.color) {
            paddleColor = cosmetic.color;
            glowColor = cosmetic.color;
        }

        // Glow effect for neon
        if (cosmetic.glow) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 15;
        }

        // Gold shine effect
        if (cosmetic.shine) {
            const shimmer = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            ctx.globalAlpha = shimmer;
        }
    }

    // Draw paddle body
    if (cosmetic && cosmetic.pixelated) {
        // Pixelated paddle - draw as blocks
        ctx.fillStyle = paddleColor;
        const blockSize = 5;
        for (let bx = 0; bx < w; bx += blockSize) {
            for (let by = 0; by < h; by += blockSize) {
                ctx.fillRect(x + bx, y + by, blockSize - 1, blockSize - 1);
            }
        }
        ctx.restore();
    } else if (paddleStyle === 'candy') {
        // CAKE theme - Candy/pastry style paddle
        ctx.restore();

        // Drop shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;

        // Main body - soft rounded
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, cornerRadius);
        const candyGradient = ctx.createLinearGradient(x, y, x, y + h);
        candyGradient.addColorStop(0, lightenColor(paddleColor, 0.3));
        candyGradient.addColorStop(0.4, paddleColor);
        candyGradient.addColorStop(1, darkenColor(paddleColor, 0.2));
        ctx.fillStyle = candyGradient;
        ctx.fill();
        ctx.restore();

        // Frosting/cream on top
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + 3, w * 0.4, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sprinkles
        const sprinkleColors = ['#ff69b4', '#ffff00', '#00ff88', '#00ccff'];
        for (let i = 0; i < 5; i++) {
            const sx = x + 10 + (w - 20) * (i / 4);
            const sy = y + h * 0.5 + Math.sin(sx + animationTime) * 2;
            ctx.fillStyle = sprinkleColors[i % sprinkleColors.length];
            ctx.fillRect(sx - 2, sy - 1, 4, 2);
        }

        // Soft border
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, w - 4, h - 4, cornerRadius - 1);
        ctx.stroke();

    } else if (paddleStyle === 'spaceship') {
        // ASTRO theme - Spaceship style paddle
        ctx.restore();

        // Outer glow
        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12;

        // Main body - angular spaceship shape
        ctx.beginPath();
        ctx.moveTo(x + 8, y);
        ctx.lineTo(x + w - 8, y);
        ctx.lineTo(x + w, y + h / 2);
        ctx.lineTo(x + w - 8, y + h);
        ctx.lineTo(x + 8, y + h);
        ctx.lineTo(x, y + h / 2);
        ctx.closePath();

        const spaceGradient = ctx.createLinearGradient(x, y, x, y + h);
        spaceGradient.addColorStop(0, lightenColor(paddleColor, 0.4));
        spaceGradient.addColorStop(0.5, paddleColor);
        spaceGradient.addColorStop(1, darkenColor(paddleColor, 0.3));
        ctx.fillStyle = spaceGradient;
        ctx.fill();
        ctx.restore();

        // Cockpit window
        const cockpitX = x + w / 2;
        ctx.fillStyle = 'rgba(100,200,255,0.6)';
        ctx.beginPath();
        ctx.ellipse(cockpitX, y + h / 2, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Engine glow (left and right)
        const enginePulse = 0.5 + 0.5 * Math.sin(animationTime * 8);
        ctx.fillStyle = `rgba(255,150,50,${enginePulse})`;
        ctx.beginPath();
        ctx.arc(x + 4, y + h / 2, 4, 0, Math.PI * 2);
        ctx.arc(x + w - 4, y + h / 2, 4, 0, Math.PI * 2);
        ctx.fill();

        // Hull lines
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 3);
        ctx.lineTo(x + w - 20, y + 3);
        ctx.moveTo(x + 20, y + h - 3);
        ctx.lineTo(x + w - 20, y + h - 3);
        ctx.stroke();

    } else {
        // CODE theme - Tech style paddle (default)
        ctx.restore();

        // Outer glow effect
        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15 + 5 * Math.sin(animationTime * 3);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Main body with rounded corners
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, cornerRadius);

        // Metallic gradient
        const bodyGradient = ctx.createLinearGradient(x, y, x, y + h);
        bodyGradient.addColorStop(0, lightenColor(paddleColor, 0.4));
        bodyGradient.addColorStop(0.2, paddleColor);
        bodyGradient.addColorStop(0.5, darkenColor(paddleColor, 0.2));
        bodyGradient.addColorStop(0.8, paddleColor);
        bodyGradient.addColorStop(1, darkenColor(paddleColor, 0.4));
        ctx.fillStyle = bodyGradient;
        ctx.fill();

        ctx.restore();

        // Inner highlight strip (top)
        const highlightGradient = ctx.createLinearGradient(x, y, x + w, y);
        highlightGradient.addColorStop(0, 'rgba(255,255,255,0)');
        highlightGradient.addColorStop(0.3, 'rgba(255,255,255,0.6)');
        highlightGradient.addColorStop(0.5, 'rgba(255,255,255,0.8)');
        highlightGradient.addColorStop(0.7, 'rgba(255,255,255,0.6)');
        highlightGradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = highlightGradient;
        ctx.fillRect(x + cornerRadius, y + 2, w - cornerRadius * 2, 3);

        // Edge accents (left and right neon strips)
        const accentWidth = 6;
        ctx.fillStyle = lightenColor(paddleColor, 0.5);
        ctx.fillRect(x + 2, y + 3, accentWidth, h - 6);
        ctx.fillRect(x + w - accentWidth - 2, y + 3, accentWidth, h - 6);

        // Neon border
        ctx.strokeStyle = lightenColor(paddleColor, 0.3);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, cornerRadius);
        ctx.stroke();

        // Inner dark line for depth
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, w - 2, h - 2, cornerRadius - 1);
        ctx.stroke();

        // Center energy core
        const coreX = x + w / 2;
        const coreWidth = Math.min(40, w * 0.3);
        const pulse = 0.6 + 0.4 * Math.sin(animationTime * 5);
        const coreGradient = ctx.createRadialGradient(coreX, y + h / 2, 0, coreX, y + h / 2, coreWidth / 2);
        coreGradient.addColorStop(0, `rgba(255,255,255,${pulse * 0.8})`);
        coreGradient.addColorStop(0.5, adjustAlpha(paddleColor, pulse * 0.5));
        coreGradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = coreGradient;
        ctx.fillRect(coreX - coreWidth / 2, y, coreWidth, h);
    }

    // Fire particle effect for fire cosmetic
    if (cosmetic && cosmetic.particles === 'fire') {
        const firePulse = 0.6 + 0.4 * Math.sin(animationTime * 10);
        ctx.save();
        ctx.shadowColor = '#ff4400';
        ctx.shadowBlur = 12 * firePulse;

        for (let i = 0; i < 5; i++) {
            const fx = x + w * 0.1 + (w * 0.8) * (i / 4);
            const fy = y - 3 - Math.sin(animationTime * 8 + i) * 4;
            const fsize = 2 + Math.sin(animationTime * 10 + i * 2) * 1.5;
            const fireGradient = ctx.createRadialGradient(fx, fy, 0, fx, fy, fsize);
            fireGradient.addColorStop(0, 'rgba(255,255,100,0.8)');
            fireGradient.addColorStop(0.5, 'rgba(255,100,0,0.5)');
            fireGradient.addColorStop(1, 'rgba(255,0,0,0)');
            ctx.fillStyle = fireGradient;
            ctx.beginPath();
            ctx.arc(fx, fy, fsize, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // Magnet indicator (enhanced)
    if (paddle.hasMagnet) {
        const magnetPulse = 0.5 + 0.5 * Math.sin(animationTime * 6);
        ctx.save();
        ctx.shadowColor = '#ff8800';
        ctx.shadowBlur = 10 * magnetPulse;
        ctx.fillStyle = `rgba(255,136,0,${0.6 + magnetPulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(x + w / 2, y - 8, 5, 0, Math.PI * 2);
        ctx.fill();
        // Magnet field lines
        ctx.strokeStyle = `rgba(255,136,0,${magnetPulse * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + w / 2, y - 8, 8 + 4 * magnetPulse, 0, Math.PI, true);
        ctx.stroke();
        ctx.restore();
    }

    // Laser indicators (enhanced with turrets)
    if (activePowerups.LASER) {
        const laserPulse = 0.7 + 0.3 * Math.sin(animationTime * 8);
        ctx.save();
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 8 * laserPulse;

        // Left turret
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.moveTo(x + 8, y);
        ctx.lineTo(x + 12, y - 8);
        ctx.lineTo(x + 16, y);
        ctx.closePath();
        ctx.fill();

        // Right turret
        ctx.beginPath();
        ctx.moveTo(x + w - 16, y);
        ctx.lineTo(x + w - 12, y - 8);
        ctx.lineTo(x + w - 8, y);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // Fireball indicator (fire effect on paddle)
    if (activePowerups.FIREBALL) {
        const firePulse = 0.6 + 0.4 * Math.sin(animationTime * 10);
        ctx.save();
        ctx.shadowColor = '#ff4400';
        ctx.shadowBlur = 15 * firePulse;

        // Fire particles above paddle
        for (let i = 0; i < 5; i++) {
            const fx = x + w * 0.2 + (w * 0.6) * (i / 4);
            const fy = y - 5 - Math.sin(animationTime * 8 + i) * 5;
            const fsize = 3 + Math.sin(animationTime * 10 + i * 2) * 2;
            const fireGradient = ctx.createRadialGradient(fx, fy, 0, fx, fy, fsize);
            fireGradient.addColorStop(0, 'rgba(255,255,100,0.9)');
            fireGradient.addColorStop(0.5, 'rgba(255,100,0,0.6)');
            fireGradient.addColorStop(1, 'rgba(255,0,0,0)');
            ctx.fillStyle = fireGradient;
            ctx.beginPath();
            ctx.arc(fx, fy, fsize, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

/**
 * Draw all balls with special effects for powerups
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} balls - Array of ball objects
 * @param {object} activePowerups - Active powerups state
 */
export function drawBalls(ctx, balls, activePowerups) {
    for (const ball of balls) {
        if (!ball.visible && !activePowerups.GLITCH) continue;

        // Glitch effect - show warning indicator
        if (!ball.visible) {
            ctx.strokeStyle = '#ff0088';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            continue;
        }

        // Fireball effect
        if (ball.fireball) {
            const firePulse = 0.7 + 0.3 * Math.sin(animationTime * 12);

            // Outer fire glow
            ctx.save();
            ctx.shadowColor = '#ff4400';
            ctx.shadowBlur = 20 * firePulse;

            // Fire trail particles
            for (let i = 0; i < 6; i++) {
                const trailOffset = i * 3;
                const trailX = ball.x - (ball.dx * trailOffset * 0.15);
                const trailY = ball.y - (ball.dy * trailOffset * 0.15);
                const trailSize = ball.radius * (1 - i * 0.12);
                const trailAlpha = (1 - i * 0.15) * firePulse;

                const fireGrad = ctx.createRadialGradient(trailX, trailY, 0, trailX, trailY, trailSize * 2);
                fireGrad.addColorStop(0, `rgba(255,255,100,${trailAlpha})`);
                fireGrad.addColorStop(0.4, `rgba(255,150,0,${trailAlpha * 0.7})`);
                fireGrad.addColorStop(0.7, `rgba(255,50,0,${trailAlpha * 0.4})`);
                fireGrad.addColorStop(1, 'rgba(255,0,0,0)');
                ctx.fillStyle = fireGrad;
                ctx.beginPath();
                ctx.arc(trailX, trailY, trailSize * 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Fire core gradient
            const fireGradient = ctx.createRadialGradient(
                ball.x, ball.y, 0,
                ball.x, ball.y, ball.radius * 2.5
            );
            fireGradient.addColorStop(0, '#ffffff');
            fireGradient.addColorStop(0.2, '#ffffaa');
            fireGradient.addColorStop(0.4, '#ffaa00');
            fireGradient.addColorStop(0.6, '#ff6600');
            fireGradient.addColorStop(0.8, '#ff3300');
            fireGradient.addColorStop(1, 'transparent');

            ctx.fillStyle = fireGradient;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius * 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Bright white core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius * 0.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        } else {
            // Check for speed-modified ball effects
            const speedRatio = ball.speed / ball.baseSpeed;
            const isSlowMo = speedRatio < 0.9;
            const isFastBall = speedRatio > 1.1;

            if (isSlowMo) {
                // Slowmo effect - blue/cyan frozen look
                const slowPulse = 0.7 + 0.3 * Math.sin(animationTime * 4);
                ctx.save();
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 15 * slowPulse;

                // Time-frozen particle ring
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 + animationTime * 0.5;
                    const px = ball.x + Math.cos(angle) * (ball.radius + 5);
                    const py = ball.y + Math.sin(angle) * (ball.radius + 5);
                    ctx.fillStyle = `rgba(0,255,255,${slowPulse * 0.6})`;
                    ctx.beginPath();
                    ctx.arc(px, py, 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Cyan glow
                const slowGradient = ctx.createRadialGradient(
                    ball.x, ball.y, 0,
                    ball.x, ball.y, ball.radius * 2.5
                );
                slowGradient.addColorStop(0, '#ffffff');
                slowGradient.addColorStop(0.3, '#88ffff');
                slowGradient.addColorStop(0.6, '#00ddff');
                slowGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = slowGradient;
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius * 2.5, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            } else if (isFastBall) {
                // Fast ball effect - red/orange speed blur
                const fastPulse = 0.8 + 0.2 * Math.sin(animationTime * 15);
                ctx.save();
                ctx.shadowColor = '#ff4400';
                ctx.shadowBlur = 12 * fastPulse;

                // Speed lines behind ball
                const speedDir = Math.atan2(ball.dy, ball.dx);
                for (let i = 0; i < 4; i++) {
                    const lineLength = 10 + i * 5;
                    const lineX = ball.x - Math.cos(speedDir) * (ball.radius + 5 + i * 6);
                    const lineY = ball.y - Math.sin(speedDir) * (ball.radius + 5 + i * 6);
                    const alpha = (1 - i * 0.2) * fastPulse;
                    ctx.strokeStyle = `rgba(255,100,0,${alpha})`;
                    ctx.lineWidth = 3 - i * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(lineX, lineY);
                    ctx.lineTo(lineX - Math.cos(speedDir) * lineLength, lineY - Math.sin(speedDir) * lineLength);
                    ctx.stroke();
                }

                // Red-orange glow
                const fastGradient = ctx.createRadialGradient(
                    ball.x, ball.y, 0,
                    ball.x, ball.y, ball.radius * 2
                );
                fastGradient.addColorStop(0, '#ffffff');
                fastGradient.addColorStop(0.3, '#ffaa66');
                fastGradient.addColorStop(0.6, '#ff4400');
                fastGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = fastGradient;
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius * 2, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            } else {
                // Normal ball glow
                const gradient = ctx.createRadialGradient(
                    ball.x, ball.y, 0,
                    ball.x, ball.y, ball.radius * 2
                );
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.3, '#00ff88');
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius * 2, 0, Math.PI * 2);
                ctx.fill();

                // Ball core
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

/**
 * Draw powerups
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} powerups - Array of powerup entities
 */
export function drawPowerups(ctx, powerups) {
    for (const powerup of powerups) {
        // Background
        ctx.fillStyle = powerup.positive ?
            'rgba(0,255,136,0.3)' : 'rgba(255,68,85,0.3)';
        ctx.beginPath();
        ctx.arc(powerup.x, powerup.y, CONFIG.POWERUP_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = powerup.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Symbol
        ctx.fillStyle = powerup.color;
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerup.symbol, powerup.x, powerup.y);
    }
}

/**
 * Draw lasers
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} lasers - Array of laser entities
 */
export function drawLasers(ctx, lasers) {
    ctx.fillStyle = '#ff00ff';
    for (const laser of lasers) {
        ctx.fillRect(laser.x - 2, laser.y, 4, 15);
    }
}

/**
 * Draw shield
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawShield(ctx) {
    ctx.strokeStyle = 'rgba(0,255,255,0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.CANVAS_HEIGHT - 10);
    ctx.lineTo(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT - 10);
    ctx.stroke();

    // Glow effect
    ctx.strokeStyle = 'rgba(0,255,255,0.3)';
    ctx.lineWidth = 10;
    ctx.stroke();
}

/**
 * Draw particles
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} particles - Array of particle objects
 */
export function drawParticles(ctx, particles) {
    for (const p of particles) {
        ctx.globalAlpha = p.life;

        if (p.glow) {
            // Glowing particle with radial gradient
            ctx.save();
            ctx.shadowColor = p.color;
            ctx.shadowBlur = p.size * 2;
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, p.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            // Regular particle - circular instead of square
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.globalAlpha = 1;
}

/**
 * Draw floating texts
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} floatingTexts - Array of floating text objects
 */
export function drawFloatingTexts(ctx, floatingTexts) {
    ctx.font = 'bold 18px "JetBrains Mono"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const ft of floatingTexts) {
        // Slower fade - use squared life for more visible duration
        const alpha = Math.pow(ft.life, 0.7);
        ctx.globalAlpha = alpha;

        // Brighten the color for better visibility
        const brighterColor = ft.color;

        // Add glow effect
        ctx.shadowColor = brighterColor;
        ctx.shadowBlur = 12;

        // Draw dark outline first for contrast
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 4;
        ctx.strokeText(ft.text, ft.x, ft.y);

        // Draw the main text
        ctx.fillStyle = brighterColor;
        ctx.fillText(ft.text, ft.x, ft.y);

        // Draw a second lighter layer for extra pop
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
    }

    // Reset shadow and alpha
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
}

/**
 * Draw ball trail
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} ballTrail - Array of trail points
 */
export function drawBallTrail(ctx, ballTrail) {
    for (const point of ballTrail) {
        ctx.globalAlpha = point.life * 0.3;
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.arc(point.x, point.y, CONFIG.BALL_RADIUS * point.life, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

/**
 * Update powerup indicators in the DOM
 * @param {HTMLElement} container - DOM container for indicators
 * @param {object} activePowerups - Active powerups state
 */
export function updatePowerupIndicators(container, activePowerups) {
    container.textContent = ''; // Clear existing

    const now = Date.now();
    for (const [type, powerupData] of Object.entries(activePowerups)) {
        const powerupDef = POWERUP_TYPES[type];
        if (!powerupDef) continue;

        // Support both old format (number) and new format (object with stacks)
        const expiry = typeof powerupData === 'object' ? powerupData.expiry : powerupData;
        const stacks = typeof powerupData === 'object' ? powerupData.stacks : 1;

        const remaining = Math.max(0, Math.ceil((expiry - now) / 1000));
        if (remaining <= 0) continue;

        const indicator = document.createElement('div');
        indicator.className = `powerup-indicator ${powerupDef.positive ? 'positive' : 'negative'}`;

        // Show stack count if > 1
        const stackText = stacks > 1 ? ` x${stacks}` : '';
        indicator.textContent = `${powerupDef.name}${stackText} ${remaining}s`;
        container.appendChild(indicator);
    }
}

/**
 * Complete render pass for the game
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} gameData - All game data needed for rendering
 */
export function render(ctx, gameData) {
    const {
        levelData,
        paddle,
        balls,
        bricks,
        powerups,
        lasers,
        shield,
        particles,
        floatingTexts,
        ballTrail,
        activePowerups,
        paddleCosmetic,
    } = gameData;

    clearCanvas(ctx);
    drawBackground(ctx, levelData);
    drawBricks(ctx, bricks);
    drawPowerups(ctx, powerups);
    drawLasers(ctx, lasers);

    if (shield) {
        drawShield(ctx);
    }

    drawPaddle(ctx, paddle, levelData, activePowerups, paddleCosmetic);

    // Draw split paddle if active
    if (paddle.isSplit && paddle.splitPaddle) {
        drawPaddle(ctx, paddle.splitPaddle, levelData, activePowerups, paddleCosmetic);
    }

    drawBallTrail(ctx, ballTrail);
    drawBalls(ctx, balls, activePowerups);
    drawParticles(ctx, particles);
    drawFloatingTexts(ctx, floatingTexts);
}
