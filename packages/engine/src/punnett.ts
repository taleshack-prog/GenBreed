/**
 * Motor de Punnett — distribuições EXATAS de genótipos/fenótipos da prole
 * (TDD §4.2). Probabilidades teóricas (não amostragem), com tolerância zero.
 *
 *   P(G_filho) = P(g_pai) × P(g_mãe)
 *
 * É a base científica dos golden tests para segregação 3:1, reaparecimento de
 * homozigotos recessivos (25%) e frequência de recombinantes raros.
 */

import type { LocusPair } from "@genbreedai/shared";
import type { LocusDef, SpeciesPack } from "./types";
import { baseAllele } from "./gamete";

export type Distribution = Map<string, number>;

/** Chave canônica de um genótipo de loco, independente da ordem: "b/b", "B/b". */
export function genotypeKey(a: string, b: string): string {
  const [x, y] = [baseAllele(a), baseAllele(b)].sort();
  return `${x}/${y}`;
}

/** Frequências gaméticas de um loco: {alelo → probabilidade}. */
export function gameteFrequencies(pair: LocusPair): Distribution {
  const a = baseAllele(pair[0]);
  const b = baseAllele(pair[1]);
  const dist: Distribution = new Map();
  if (a === b) {
    dist.set(a, 1);
  } else {
    dist.set(a, 0.5);
    dist.set(b, 0.5);
  }
  return dist;
}

/**
 * Distribuição de GENÓTIPOS da prole em UM loco (quadro de Punnett).
 * Retorna {chaveGenótipo → probabilidade}.
 */
export function punnettLocus(pairA: LocusPair, pairB: LocusPair): Distribution {
  const gA = gameteFrequencies(pairA);
  const gB = gameteFrequencies(pairB);
  const out: Distribution = new Map();
  for (const [alA, pA] of gA) {
    for (const [alB, pB] of gB) {
      const key = genotypeKey(alA, alB);
      out.set(key, (out.get(key) ?? 0) + pA * pB);
    }
  }
  return out;
}

/**
 * Distribuição de FENÓTIPOS da prole em UM loco, aplicando dominância.
 * Retorna {descritorFenotípico → probabilidade}. Ex.: B/b×B/b → 3:1.
 */
export function punnettPhenotypeLocus(
  def: LocusDef,
  pairA: LocusPair,
  pairB: LocusPair,
): Distribution {
  const geno = punnettLocus(pairA, pairB);
  const out: Distribution = new Map();
  for (const [key, p] of geno) {
    const [x, y] = key.split("/");
    const descriptor = expressLocusDescriptor(def, x!, y!);
    out.set(descriptor, (out.get(descriptor) ?? 0) + p);
  }
  return out;
}

/** Reaproveita a lógica de dominância da expressão (versão pura para Punnett). */
function expressLocusDescriptor(def: LocusDef, a: string, b: string): string {
  if (a === b) return def.phenotypeByAllele[a] ?? a;
  if (def.dominance === "COMPLETE") {
    const ra = def.dominanceRank.indexOf(a);
    const rb = def.dominanceRank.indexOf(b);
    const dominant = ra <= rb ? a : b;
    return def.phenotypeByAllele[dominant] ?? dominant;
  }
  const ra = def.dominanceRank.indexOf(a);
  const rb = def.dominanceRank.indexOf(b);
  const [hi, lo] = ra <= rb ? [a, b] : [b, a];
  return (
    def.heteroPhenotype?.[`${hi}|${lo}`] ??
    `${def.phenotypeByAllele[a] ?? a}+${def.phenotypeByAllele[b] ?? b}`
  );
}

/** Probabilidade de um genótipo-alvo específico em um loco (ex.: "m/m"). */
export function genotypeProbability(
  pairA: LocusPair,
  pairB: LocusPair,
  targetGenotypeKey: string,
): number {
  return punnettLocus(pairA, pairB).get(targetGenotypeKey) ?? 0;
}

/**
 * Probabilidade CONJUNTA de um genótipo multi-loco (montagem independente).
 * `target` mapeia loco → chave de genótipo (ex.: { M: "M/m", A: "a/a", S: "s^p/s^p" }).
 */
export function jointGenotypeProbability(
  parentA: Record<string, LocusPair>,
  parentB: Record<string, LocusPair>,
  target: Record<string, string>,
): number {
  let p = 1;
  for (const [locus, wantKey] of Object.entries(target)) {
    const pa = parentA[locus];
    const pb = parentB[locus];
    if (!pa || !pb) return 0;
    p *= genotypeProbability(pa, pb, wantKey);
  }
  return p;
}

/**
 * Enumeração completa de classes fenotípicas de um cruzamento multi-loco,
 * usada para verificar "N classes fenotípicas" (ex.: Boerpointer F2 = 6).
 */
export function phenotypeClasses(
  parentA: Record<string, LocusPair>,
  parentB: Record<string, LocusPair>,
  pack: SpeciesPack,
  loci: string[],
): Distribution {
  let combos: Array<{ desc: string; p: number }> = [{ desc: "", p: 1 }];
  for (const locus of loci) {
    const def = pack.loci[locus];
    const pa = parentA[locus];
    const pb = parentB[locus];
    if (!def || !pa || !pb) continue;
    const locusDist = punnettPhenotypeLocus(def, pa, pb);
    const next: Array<{ desc: string; p: number }> = [];
    for (const c of combos) {
      for (const [d, pd] of locusDist) {
        next.push({
          desc: c.desc ? `${c.desc} | ${locus}:${d}` : `${locus}:${d}`,
          p: c.p * pd,
        });
      }
    }
    combos = next;
  }
  const out: Distribution = new Map();
  for (const c of combos) out.set(c.desc, (out.get(c.desc) ?? 0) + c.p);
  return out;
}
