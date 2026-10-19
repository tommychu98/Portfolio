// Remove only the GIF loop extension; keep every original image frame intact.
// This also supports mobile browsers without ImageDecoder.
export function singlePlayGif(buffer, playbackRate = 1) {
  const bytes = new Uint8Array(buffer.slice(0));
  const parts = [];
  let offset = 13 + ((bytes[10] & 128) ? 3 * (2 ** ((bytes[10] & 7) + 1)) : 0);
  let start = 0, duration = 0, delay = 100;
  const skipBlocks = () => {
    while (offset < bytes.length) {
      const size = bytes[offset++];
      if (!size) break;
      offset += size;
    }
  };
  while (offset < bytes.length) {
    const blockStart = offset;
    const marker = bytes[offset++];
    if (marker === 0x3b) break;
    if (marker === 0x21) {
      const label = bytes[offset++];
      if (label === 0xf9) {
        const originalDelay = bytes[offset + 2] | (bytes[offset + 3] << 8);
        const adjustedDelay = Math.max(2, Math.round(originalDelay / playbackRate));
        bytes[offset + 2] = adjustedDelay & 0xff;
        bytes[offset + 3] = adjustedDelay >> 8;
        delay = adjustedDelay * 10;
      }
      const application = label === 0xff
        ? new TextDecoder().decode(bytes.slice(offset + 1, offset + 12)) : '';
      skipBlocks();
      if (application === 'NETSCAPE2.0' || application === 'ANIMEXTS1.0') {
        parts.push(bytes.slice(start, blockStart));
        start = offset;
      }
    } else if (marker === 0x2c) {
      const packed = bytes[offset + 8];
      offset += 9 + ((packed & 128) ? 3 * (2 ** ((packed & 7) + 1)) : 0);
      offset++; // LZW minimum code size
      skipBlocks();
      duration += delay;
      delay = 100;
    } else throw new Error('Invalid GIF block');
  }
  parts.push(bytes.slice(start));
  return { blob: new Blob(parts, { type: 'image/gif' }), duration };
}
