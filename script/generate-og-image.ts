import sharp from "sharp";
import path from "path";
import fs from "fs";

const svgPath = path.resolve("client/public/og-image.svg");
const pngPath = path.resolve("client/public/og-image.png");

async function generate() {
  const svg = fs.readFileSync(svgPath);
  await sharp(svg).resize(1200, 630).png({ quality: 90 }).toFile(pngPath);
  console.log("✅ Generated og-image.png (1200×630)");
}

generate().catch((err) => {
  console.error("Failed to generate OG image:", err);
  process.exit(1);
});
