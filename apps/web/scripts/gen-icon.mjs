// Generates a square PNG of the Nook "N." mark (for Slack/Discord app icons,
// social images, etc.). Run: node scripts/gen-icon.mjs [size]
import sharp from "sharp";

const size = Number(process.argv[2] ?? 512);

const svg = `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="#000000"/>
  <path d="M8.5 22.5 V10.5 L20 22.5 V10.5" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="24" cy="21" r="2.3" fill="#16F5A3"/>
</svg>`;

const out = `public/branding/icon-${size}.png`;
await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`wrote ${out} (${size}x${size})`);
