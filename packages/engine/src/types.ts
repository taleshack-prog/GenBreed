/**
 * Tipos internos do motor genético. Descrevem *como* um data pack define seus
 * loci — dominância, hierarquia alélica, epistasia e combinações letais.
 *
 * Regra anti-alucinação (TDD §0): loci, alelos e regras vêm SEMPRE de um
 * SpeciesPack documentado (ver src/data/*). O motor nunca infere loci fora dele.
 */

import type { Allele, Dominance, Genotype } from "@genbreedai/shared";

export type { Allele, Dominance, Genotype };

/**
 * Regra de epistasia: quando o loco `modifierLocus` contém `whenAllelePresent`,
 * o fenótipo do `targetLocus` é sobrescrito por `override`.
 * Ex.: Harlequin (H) sobre Merle (M) → manchas merle viram branco (TDD §4.1).
 */
export interface EpistasisRule {
  modifierLocus: string;
  whenAllelePresent: Allele;
  targetLocus: string;
  /** Só dispara se o alvo estiver expressando este alelo (opcional). */
  targetWhenAllelePresent?: Allele;
  override: string;
  label: string;
}

/**
 * Combinação letal: genótipo homozigoto (ou par específico) que inviabiliza o
 * embrião. Ex.: M/M (duplo-merle) — TDD §4.1.
 */
export interface LethalCombo {
  locus: string;
  /** Par de alelos que, presentes juntos no zigoto, é letal. */
  genotype: [Allele, Allele];
  label: string;
}

/**
 * Definição de um loco dentro de um data pack.
 */
export interface LocusDef {
  name: string;
  /** Todos os alelos conhecidos deste loco. */
  alleles: Allele[];
  dominance: Dominance;
  /**
   * Hierarquia de dominância, do mais dominante ao mais recessivo.
   * Obrigatória para dominância COMPLETE com múltiplos alelos.
   */
  dominanceRank: Allele[];
  /**
   * Mapa alelo → descritor fenotípico usado na expressão.
   * Para INCOMPLETE/CODOMINANT, o heterozigoto usa `heteroPhenotype`.
   */
  phenotypeByAllele: Record<Allele, string>;
  /** Descritores de heterozigotos para dominância incompleta/codominante. */
  heteroPhenotype?: Record<string, string>;
  mutationRate: number;
}

/**
 * Data pack de uma espécie/arquétipo: conjunto de loci + regras epistáticas +
 * letais + traços quantitativos.
 */
export interface SpeciesPack {
  id: string;
  slug: string;
  archetype: string;
  loci: Record<string, LocusDef>;
  epistasis: EpistasisRule[];
  lethals: LethalCombo[];
  /** QTLs conhecidos e sua herdabilidade h² (TDD §4.1). */
  quantitative: Record<string, { mean: number; h2: number }>;
}

// ─── Pedigree (para F de Wright, TDD §4.2) ────────────────────────────────────

/**
 * Nó de pedigree. `sire`/`dam` referenciam ids de ancestrais no mesmo mapa;
 * fundadores têm sire/dam nulos (não-endogâmicos, não-aparentados entre si).
 */
export interface PedigreeNode {
  id: string;
  sire: string | null;
  dam: string | null;
}

export type Pedigree = Record<string, PedigreeNode>;

// ─── Gametas ──────────────────────────────────────────────────────────────────

/** Um gameta carrega 1 alelo por loco + QTLs contribuídos + flags de mutação. */
export interface Gamete {
  loci: Record<string, Allele>;
  qtl: Record<string, number>;
  mutations: string[];
}
