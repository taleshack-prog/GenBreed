/**
 * Orquestrador de cruzamento (TDD §4.4).
 *
 * cross() é a única porta de entrada estocástica do motor. É DETERMINÍSTICA sob
 * (genótipos + método + seed) e TIER-AGNÓSTICA: não recebe tier de usuário —
 * essa é a garantia estrutural anti-P2W (TDD §0). Nenhuma probabilidade muda
 * por assinatura; tiers afetam apenas cotas/ferramentas fora do motor.
 */

import {
  CURRENT_ART_VERSION,
  type BreedingMethod,
  type CrossResult,
  type Genotype,
} from "@genbreedai/shared";
import type { Pedigree, SpeciesPack } from "./types";
import { createPrng } from "./rng";
import { generateGamete, combineGametes } from "./gamete";
import { expressPhenotype } from "./phenotype";
import { wrightF } from "./wright";
import { fertilityScore } from "./fertility";
import { fixationIndex, mapFixationToAura } from "./fixation";
import { sha256 } from "./sha256";

export interface ParentInput {
  /** Id do indivíduo no pedigree (para F de Wright). */
  id: string;
  genotype: Genotype;
  generation: number;
}

export interface CrossContext {
  pack: SpeciesPack;
  /** Pedigree contendo pai, mãe e ancestrais comuns (para F_pedigree). */
  pedigree: Pedigree;
  /** True quando os progenitores são de espécies distintas (Haldane em F1). */
  interspecific?: boolean;
  /** Loci que o jogador tenta fixar (para o IF). Default: todos os loci. */
  targetLoci?: string[];
  /** Gerações sob seleção direcionada (para o IF). Default: geração da prole. */
  generationsUnderSelection?: number;
  /** Sobrescreve µ de mutação (uso em testes). Default: por-loco do pack. */
  mutationRateOverride?: number;
}

/** Validação de restrições de cruzamento (TDD §4.4, passo 1). */
export function validateBreedingConstraints(
  parentA: ParentInput,
  parentB: ParentInput,
  pack: SpeciesPack,
): void {
  const packLoci = new Set(Object.keys(pack.loci));
  for (const p of [parentA, parentB]) {
    for (const locus of Object.keys(p.genotype.loci)) {
      if (!packLoci.has(locus)) {
        throw new Error(
          `Loco "${locus}" do espécime ${p.id} não pertence ao pack ${pack.slug}.`,
        );
      }
    }
  }
}

/** Gera o genótipo canônico em string (ordenado) para hash de cache/proveniência. */
export function hashGenotype(genotype: Genotype): string {
  const loci = Object.keys(genotype.loci)
    .sort()
    .map((k) => {
      const [a, b] = genotype.loci[k]!;
      const pair = [a, b].sort();
      return `${k}:${pair[0]}/${pair[1]}`;
    })
    .join(",");
  const qtl = Object.keys(genotype.qtl)
    .sort()
    .map((k) => `${k}=${genotype.qtl[k]!.toFixed(6)}`)
    .join(",");
  return `loci{${loci}}|qtl{${qtl}}`;
}

export function cross(
  parentA: ParentInput,
  parentB: ParentInput,
  method: BreedingMethod,
  seed: string,
  ctx: CrossContext,
): CrossResult {
  // 1. Validação.
  validateBreedingConstraints(parentA, parentB, ctx.pack);

  // 2. PRNG determinístico.
  const rng = createPrng(seed);

  // 3. Gametas independentes com mutação.
  const gameteA = generateGamete(parentA.genotype, rng, ctx.pack, ctx.mutationRateOverride);
  const gameteB = generateGamete(parentB.genotype, rng, ctx.pack, ctx.mutationRateOverride);

  // 4. Fusão no zigoto.
  const zygote = combineGametes(gameteA, gameteB);

  // 5. Expressão fenotípica.
  const phenotype = expressPhenotype(zygote, ctx.pack);

  // 6. F de Wright, fertilidade e fixação.
  const fPedigree = wrightF(ctx.pedigree, parentA.id, parentB.id);
  const fertility = fertilityScore(method, fPedigree, {
    interspecific: ctx.interspecific ?? false,
    rng,
  });

  const generation = Math.max(parentA.generation, parentB.generation) + 1;
  const targetLoci = ctx.targetLoci ?? Object.keys(zygote.loci);
  const generationsUnderSelection = ctx.generationsUnderSelection ?? generation;

  const fixation = fixationIndex({
    genotype: zygote,
    targetLoci,
    fPedigree,
    generationsUnderSelection,
  });
  const aura = mapFixationToAura(fixation.index);

  // 7. Chave de cache (TDD §5.1).
  const cacheKey = sha256(
    hashGenotype(zygote) + "|" + ctx.pack.id + "|" + CURRENT_ART_VERSION,
  );

  return {
    specimen: {
      genotype: zygote,
      phenotype,
      fPedigree: Number(fPedigree.toFixed(6)),
      fertility,
      fixationIndex: fixation.index,
      aura,
      generation,
      method,
    },
    cacheKey,
  };
}
