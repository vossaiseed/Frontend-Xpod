// One-off: convert oversized landing-page PNGs to right-sized WebP.
// Display sizes are far smaller than the source dimensions, so we resize then
// encode WebP. Run: node scripts/optimize-images.mjs
import sharp from "sharp";
import path from "node:path";

const DIR = path.resolve("src/assets/images");

// [file, maxWidth, quality]. WebP keeps alpha for the transparent logo.
const JOBS = [
    ["hero-image.png", 1379, 78], // full-bleed hero bg — keep width, just recompress
    ["product-1.png", 800, 80],   // shown ~400px on desktop, 56px mobile
    ["product-2.png", 800, 80],
    ["product-3.png", 800, 80],
    ["logo2.png", 320, 86],       // displayed ~24px tall
    ["xpod-logo.png", 380, 92],   // displayed ~120px tall, has transparency
];

for (const [file, width, quality] of JOBS) {
    const src = path.join(DIR, file);
    const out = path.join(DIR, file.replace(/\.png$/, ".webp"));
    const info = await sharp(src)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality })
        .toFile(out);
    console.log(`${file} -> ${path.basename(out)}  ${width}w  ${(info.size / 1024).toFixed(0)} KB`);
}
console.log("Done.");
