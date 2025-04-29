export const radToDeg = (rad) => rad * (180/Math.PI);
export const lerp = ( a, b, alpha ) => a + alpha * ( b - a );

function murmurhash3_32(key, seed = 0) {
  let h1 = seed ^ key;
  h1 = Math.imul(h1, 0xcc9e2d51);
  h1 = (h1 << 15) | (h1 >>> 17);
  h1 = Math.imul(h1, 0x1b873593);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 16;
  return h1 >>> 0; // Convert to unsigned 32-bit integer
}

export function seededRandom(unsignedInt) {
  const hash = murmurhash3_32(unsignedInt);
  return (hash % 1000000) / 1000000; // Normalize to [0,1)
}

export function calculateAngle(x1, y1, x2, y2) {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const radians = Math.atan2(deltaY, deltaX);
  const degrees = radians * (180 / Math.PI);
  return degrees;
}

/**
 * 
 * @param {File} file 
 * @returns {string}
 */
export function readInputFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.onerror = () => reject(new Error("Something failed during reading file"));
  
    reader.readAsText(file);
  });
}

export function createNDJSONStream() {
  let buffer = '';
  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        console.log(line);
        if (line) controller.enqueue(JSON.parse(line));
      }
    },
    flush(controller) {
      console.log(buffer);
      if (buffer) controller.enqueue(JSON.parse(buffer));
    }
  });
}