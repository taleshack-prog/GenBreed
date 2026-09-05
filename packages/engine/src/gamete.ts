/**
 * Formação gamética e fusão no zigoto (TDD §4.4, passos 2–3).
 *
 * Meiose: para cada loco, um dos dois alelos parentais é sorteado com
 * probabilidade 1/2 (segregação mendeliana). Mutação espontânea aplica-se por
 * loco por gameta à taxa µ (1e-4, TDD §4.2); o alelo mutante recebe o rótulo
 * indelével "mutação".
 */

import { MUTATION_TAG } from "@genbreedai/shared";
import type { Genotype } from "@genbreedai/shared";
import type { Gamete, SpeciesPack } from "./types";
import type { Rng } from "./rng";

/** Marcador anexado a um alelo mutante. Ex.: "b" → "b⟦mutação⟧". */
const MUT_MARK = `⟦${MUTATION_TAG}⟧`;

/** Remove o rótulo de mutação para efeito de expressão/lookup. */
export function baseAllele(allele: string): string {
  return allele.endsWith(MUT_MARK) ? allele.slice(0, -MUT_MARK.length) : allele;
}

/** True se o alelo carrega o rótulo indelével de mutação. */
export function isMutant(allele: string): boolean {
  return allele.endsWith(MUT_MARK);
}

/**
 * Gera um gameta a partir de um genótipo diploide.
 * @param genotype genótipo do progenitor
 * @param rng PRNG determinístico
 * @param pack data pack (para conhecer alelos alternativos em caso de mutação)
 * @param mutationRatePerLocus taxa µ por loco por gameta (default do pack por loco)
 */
export function generateGamete(
  genotype: Genotype,
  rng: Rng,
  pack: SpeciesPack,
  mutationRateOverride?: number,
): Gamete {
  const loci: Record<string, string> = {};
  const mutations: string[] = [];

  for (const [locusName, pair] of Object.entries(genotype.loci)) {
    // Segregação: escolhe alelo 0 ou 1 com p = 1/2.
    let allele = rng.next() < 0.5 ? pair[0] : pair[1];

    const def = pack.loci[locusName];
    const µ = mutationRateOverride ?? def?.mutationRate ?? 0;

    // Mutação espontânea: substitui por um alelo alternativo do mesmo loco.
    if (µ > 0 && rng.chance(µ) && def) {
      const alternatives = def.alleles.filter((a) => a !== baseAllele(allele));
      if (alternatives.length > 0) {
        const mutant = rng.pick(alternatives);
        allele = `${mutant}${MUT_MARK}`;
        mutations.push(locusName);
      }
    }
    loci[locusName] = allele;
  }

  // QTLs: o gameta carrega metade do valor parental (contribuição aditiva).
  // O valor final da prole é a soma das duas contribuições (ver combineGametes).
  const qtl: Record<string, number> = {};
  for (const [trait, value] of Object.entries(genotype.qtl)) {
    qtl[trait] = value / 2;
  }

  return { loci, qtl, mutations };
}

/**
 * Funde dois gametas em um zigoto diploide (TDD §4.4, passo 3).
 * A ordem dos alelos em cada par é normalizada por dominância na expressão,
 * então aqui apenas empilhamos [alelo do gametaA, alelo do gametaB].
 */
export function combineGametes(gameteA: Gamete, gameteB: Gamete): Genotype {
  const loci: Record<string, [string, string]> = {};
  const allLoci = new Set([
    ...Object.keys(gameteA.loci),
    ...Object.keys(gameteB.loci),
  ]);
  for (const locus of allLoci) {
    const a = gameteA.loci[locus];
    const b = gameteB.loci[locus];
    if (a === undefined || b === undefined) {
      throw new Error(
        `combineGametes: loco "${locus}" ausente em um dos gametas (incompatibilidade de pack).`,
      );
    }
    loci[locus] = [a, b];
  }

  // QTLs: soma das contribuições (cada gameta trouxe metade do valor parental).
  const qtl: Record<string, number> = {};
  const allTraits = new Set([
    ...Object.keys(gameteA.qtl),
    ...Object.keys(gameteB.qtl),
  ]);
  for (const trait of allTraits) {
    qtl[trait] = (gameteA.qtl[trait] ?? 0) + (gameteB.qtl[trait] ?? 0);
  }

  return { loci, qtl };
}
