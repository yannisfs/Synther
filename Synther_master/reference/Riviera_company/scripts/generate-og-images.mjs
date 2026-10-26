// Generate placeholder OG images using node's built-in zlib (no external
// image dep). These are 1200x630 (default) and 512x512 (logo) solid-color
// PNGs with the brand palette. Replace with real branding before launch.
//
// Usage: node scripts/generate-og-images.mjs

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_OG = resolve(__dirname, '../public/og');

// Brand palette (matches tailwind.config.js → brand.*)
const COLORS = {
  bg:    [0x0a, 0x0a, 0x0a], // near-black
  blue:  [0x00, 0x55, 0xa4],
  red:   [0xcc, 0x00, 0x00],
  text:  [0xfc, 0xfc, 0xfc],
};

// Build a single PNG of given dimensions filled with a solid color.
function makePng(width, height, rgb) {
  // Each row: 1 filter byte (0) + width*3 RGB bytes.
  const rowBytes = 1 + width * 3;
  const raw = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y++) {
    raw[y * rowBytes] = 0; // filter "None"
    for (let x = 0; x < width; x++) {
      const off = y * rowBytes + 1 + x * 3;
      raw[off] = rgb[0];
      raw[off + 1] = rgb[1];
      raw[off + 2] = rgb[2];
    }
  }
  const compressed = zlib.deflateSync(raw);

  // PNG signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 2;   // color type 2 = RGB
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

let crcTable = null;
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      crcTable[n] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

mkdirSync(PUBLIC_OG, { recursive: true });

writeFileSync(resolve(PUBLIC_OG, 'default.png'), makePng(1200, 630, COLORS.bg));
console.log(`[og] default.png 1200x630`);

writeFileSync(resolve(PUBLIC_OG, 'logo.png'), makePng(512, 512, COLORS.bg));
console.log(`[og] logo.png 512x512`);
