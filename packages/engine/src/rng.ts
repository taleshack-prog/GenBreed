/**
 * PRNG determinístico e puro (sem I/O), semeado por string.
 *
 * Determinismo estrito (TDD §0): a mesma seed produz sempre a mesma sequência,
 * em qualquer ambiente (Node/servidor e worker do browser). Não usar Math.random.
 *
 * Algoritmo: xmur3 (hash de string → semente de 32 bits) + mulberry32 (gerador).
 * Ambos são de domínio público, rápidos e reprodutíveis.
 */

export interface Rng {
  /** Próximo float uniforme em [0, 1). */
  next(): number;
  /** Inteiro uniforme em [min, max] inclusive. */
  int(min: number, max: number): number;
  /** True com probabilidade p. */
  chance(p: number): boolean;
  /** Escolhe um elemento do array. */
  pick<T>(items: readonly T[]): T;
}

/** Hash de string para semente de 32 bits (xmur3). */
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/** Gerador mulberry32 a partir de uma semente de 32 bits. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Cria um PRNG determinístico a partir de uma seed textual.
 * Ex.: createPrng("goldendoodle-01").
 */
export function createPrng(seed: string): Rng {
  const seedFn = xmur3(seed);
  const rand = mulberry32(seedFn());

  const rng: Rng = {
    next: () => rand(),
    int: (min, max) => {
      if (max < min) throw new Error("Rng.int: max < min");
      return min + Math.floor(rand() * (max - min + 1));
    },
    chance: (p) => rand() < p,
    pick: (items) => {
      if (items.length === 0) throw new Error("Rng.pick: array vazio");
      return items[Math.floor(rand() * items.length)]!;
    },
  };
  return rng;
}
