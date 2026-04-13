import { Vector3 } from 'three';

export type HexCoord = { q: number; r: number; s: number };

export const HEX_SIZE = 1; // Distance from center to corner
export const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
export const HEX_HEIGHT = 2 * HEX_SIZE;

export const axialToCube = (q: number, r: number): HexCoord => {
  return { q, r, s: -q - r };
};

export const cubeToAxial = (hex: HexCoord) => {
  return { q: hex.q, r: hex.r };
};

export const hexToWorld = (q: number, r: number): Vector3 => {
  // Flat-topped hexes
  const x = HEX_SIZE * (3/2 * q);
  const z = HEX_SIZE * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return new Vector3(x, 0, z);
};

export const worldToHex = (x: number, z: number): { q: number; r: number } => {
  const q = (2/3 * x) / HEX_SIZE;
  const r = (-1/3 * x + Math.sqrt(3)/3 * z) / HEX_SIZE;
  return hexRound(q, r);
};

export const hexRound = (fq: number, fr: number): { q: number; r: number } => {
  let q = Math.round(fq);
  let r = Math.round(fr);
  let s = Math.round(-fq - fr);

  const dq = Math.abs(q - fq);
  const dr = Math.abs(r - fr);
  const ds = Math.abs(s - (-fq - fr));

  if (dq > dr && dq > ds) {
    q = -r - s;
  } else if (dr > ds) {
    r = -q - s;
  } else {
    // s = -q - r;
  }

  return { q, r };
};

export const getHexDistance = (a: HexCoord, b: HexCoord): number => {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
};

export const getHexNeighbors = (q: number, r: number): { q: number; r: number }[] => {
  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];
  return directions.map(d => ({ q: q + d.q, r: r + d.r }));
};

export const getHexKey = (q: number, r: number): string => `${q},${r}`;
