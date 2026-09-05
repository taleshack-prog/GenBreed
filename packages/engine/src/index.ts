/**
 * @genbreedai/engine — Motor genético determinístico (TypeScript puro, sem I/O).
 * API pública. Ver TDD §4.
 */

export * from "./types";
export { createPrng, type Rng } from "./rng";
export {
  generateGamete,
  combineGametes,
  baseAllele,
  isMutant,
} from "./gamete";
export { expressPhenotype } from "./phenotype";
export {
  gameteFrequencies,
  punnettLocus,
  punnettPhenotypeLocus,
  genotypeProbability,
  jointGenotypeProbability,
  phenotypeClasses,
  genotypeKey,
  type Distribution,
} from "./punnett";
export { kinship, wrightF, fStatistic } from "./wright";
export { fertilityScore, type FertilityOptions } from "./fertility";
export {
  fixationIndex,
  mapFixationToAura,
  targetHomozygosity,
  type FixationInput,
} from "./fixation";
export { sha256 } from "./sha256";
export {
  cross,
  validateBreedingConstraints,
  hashGenotype,
  type ParentInput,
  type CrossContext,
} from "./cross";

// Data packs documentados (derivados do Gene-Bank).
export { CANINE_PACK } from "./data/canine";
export { FELINE_PACK } from "./data/feline";
