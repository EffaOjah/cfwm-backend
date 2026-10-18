/**
 * ogImageGenerator.js
 * Generates a 1200×630 Open Graph preview image for an APAPRO devotional.
 * Uses @napi-rs/canvas (a native Node.js canvas implementation).
 */

const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Wraps `text` into lines that fit within `maxWidth` pixels.
 * Returns an array of line strings.
 */
function wrapText(ctx, text, maxWidth) {
    const words = String(text || '').split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && current) {
            lines.push(current);
            current = word;
        } else {
            current = test;
        }
    }
    if (current) lines.push(current);
    return lines;
}

/**
 * Truncates `text` to at most `maxLines` lines; appends "…" to the last if
 * the original had more.
 */
function clampLines(lines, maxLines) {
    if (lines.length <= maxLines) return lines;
    const clamped = lines.slice(0, maxLines);
    clamped[maxLines - 1] = clamped[maxLines - 1].replace(/\s+\S+$/, '') + '…';
    return clamped;
}

/** Formats a date string like "2026-10-01" → "OCTOBER 1, 2026" */
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(String(dateStr).replace(/-/g, '/'));
    return d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).toUpperCase();
}

// ─── main ─────────────────────────────────────────────────────────────────────

/**
 * Generates a PNG Buffer representing the OG image for a devotional.
 * @param {object} devotional - A devotional row from the database.
 * @returns {Buffer} PNG image data.
 */
async function generateOgImage(devotional) {
    const W = 1200;
    const H = 630;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    // ── Background: deep red-to-dark gradient ──────────────────────────────
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,   '#1a0205');
    grad.addColorStop(0.4, '#2d0308');
    grad.addColorStop(1,   '#0d0d0d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ── Decorative accent circle (top-right) ───────────────────────────────
    const radGrad = ctx.createRadialGradient(W, 0, 0, W, 0, 500);
    radGrad.addColorStop(0,   'rgba(204, 18, 26, 0.35)');
    radGrad.addColorStop(0.5, 'rgba(204, 18, 26, 0.10)');
    radGrad.addColorStop(1,   'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, W, H);

    // ── Left red accent bar ────────────────────────────────────────────────
    ctx.fillStyle = '#cc121a';
    ctx.fillRect(0, 0, 6, H);

    // ── CFWM logo text (top-left) ──────────────────────────────────────────
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('CHRIST FOR THE WORLD MISSION', 48, 54);

    // ── Horizontal rule below logo ─────────────────────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(48, 68);
    ctx.lineTo(W - 48, 68);
    ctx.stroke();

    // ── 🔥 APAPRO label ────────────────────────────────────────────────────
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#ff4d55';
    ctx.fillText('🔥 APAPRO DEVOTIONAL', 48, 112);

    // ── Date badge ─────────────────────────────────────────────────────────
    const dateText = formatDate(devotional.date);
    ctx.font = '18px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText(dateText, 48, 148);

    // ── Title ──────────────────────────────────────────────────────────────
    ctx.font = 'bold 58px sans-serif';
    ctx.fillStyle = '#ffffff';
    const titleLines = clampLines(wrapText(ctx, devotional.title || '', W - 96), 3);
    let titleY = 230;
    for (const line of titleLines) {
        ctx.fillText(line, 48, titleY);
        titleY += 68;
    }

    // ── Thin separator ─────────────────────────────────────────────────────
    const separatorY = Math.max(titleY + 16, 390);
    ctx.strokeStyle = 'rgba(204, 18, 26, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(48, separatorY);
    ctx.lineTo(200, separatorY);
    ctx.stroke();

    // ── Quote / tagline ────────────────────────────────────────────────────
    const quoteText = devotional.quote || '';
    ctx.font = 'italic 26px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.70)';
    const quoteLines = clampLines(wrapText(ctx, `"${quoteText}"`, W - 96), 2);
    let quoteY = separatorY + 44;
    for (const line of quoteLines) {
        ctx.fillText(line, 48, quoteY);
        quoteY += 36;
    }

    // ── Scripture reference (bottom area) ──────────────────────────────────
    if (devotional.scripture_ref) {
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#cc121a';
        ctx.fillText(`📖  ${devotional.scripture_ref}`, 48, H - 80);
    }

    // ── Bottom bar ─────────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(204, 18, 26, 0.18)';
    ctx.fillRect(0, H - 56, W, 56);

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.50)';
    ctx.fillText('cfwmintl.com/apapro', 48, H - 20);

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    const rightText = 'Daily Word. Divine Fire.';
    const rightW = ctx.measureText(rightText).width;
    ctx.fillText(rightText, W - 48 - rightW, H - 20);

    return canvas.toBuffer('image/png');
}

module.exports = { generateOgImage };
