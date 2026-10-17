const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const size = 128;
const scale = 4;
const supersampled = size * scale;
const highResolution = Buffer.alloc(supersampled * supersampled * 4);

function distanceToSegment(x, y, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

for (let y = 0; y < supersampled; y += 1) {
  for (let x = 0; x < supersampled; x += 1) {
    const px = (x + 0.5) / scale;
    const py = (y + 0.5) / scale;
    const dx = Math.max(0, Math.abs(px - 64) - 40);
    const dy = Math.max(0, Math.abs(py - 64) - 40);
    const roundedBackground = Math.hypot(dx, dy) <= 24;
    const radius = Math.hypot(px - 64, py - 64);
    const ring = Math.abs(radius - 36) <= 4;
    const slash = distanceToSegment(px, py, 39, 89, 89, 39) <= 5;
    const color = slash
      ? [86, 230, 184, 255]
      : ring
        ? [245, 250, 255, 255]
        : roundedBackground
          ? [20, 48, 78, 255]
          : [0, 0, 0, 0];
    const offset = (y * supersampled + x) * 4;
    highResolution.set(color, offset);
  }
}

const rgba = Buffer.alloc(size * size * 4);
for (let y = 0; y < size; y += 1) {
  for (let x = 0; x < size; x += 1) {
    const totals = [0, 0, 0, 0];
    for (let sy = 0; sy < scale; sy += 1) {
      for (let sx = 0; sx < scale; sx += 1) {
        const offset = (((y * scale + sy) * supersampled) + x * scale + sx) * 4;
        for (let channel = 0; channel < 4; channel += 1) {
          totals[channel] += highResolution[offset + channel];
        }
      }
    }
    const target = (y * size + x) * 4;
    for (let channel = 0; channel < 4; channel += 1) {
      rgba[target + channel] = Math.round(totals[channel] / (scale * scale));
    }
  }
}

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

const scanlines = Buffer.alloc(size * (size * 4 + 1));
for (let y = 0; y < size; y += 1) {
  const row = y * (size * 4 + 1);
  scanlines[row] = 0;
  rgba.copy(scanlines, row + 1, y * size * 4, (y + 1) * size * 4);
}

const header = Buffer.alloc(13);
header.writeUInt32BE(size, 0);
header.writeUInt32BE(size, 4);
header[8] = 8;
header[9] = 6;

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", header),
  chunk("IDAT", zlib.deflateSync(scanlines)),
  chunk("IEND", Buffer.alloc(0)),
]);
fs.writeFileSync(path.join(__dirname, "..", "icon-128.png"), png);
