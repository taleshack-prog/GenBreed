/**
 * Índice de Fixação IF (métrica de JOGO, TDD §4.3) e mapeamento de Auras.
 *
 *   IF = 0.5·H_alvo + 0.3·G_pedigree + 0.2·S_gerações
 *     H_alvo      = loci-alvo homozigotos / loci-alvo selecionados
 *     G_pedigree  = min(1, F_pedigree / 0.25)
 *     S_gerações  = min(1, gerações sob seleção / 7)
 *
 * ATENÇÃO (TDD §4.3): IF ≠ F_pedigree. F_pedigree é biologia (alerta de
 * depressão/esterilidade); IF é gamificação (rank/aura). Nunca confundir.
 */

import type { Aura, FixationResult, Genotype } from "@genbreedai/shared";
import { baseAllele } from "./gamete";

export interface FixationInput {
  genotype: Genotype;
  /** Loci que o jogador está tentando fixar (subconjunto dos loci do genótipo). */
  targetLoci: string[];
  fPedigree: number;
  /** Gerações sob seleção direcionada rumo ao alvo. */
  generationsUnderSelection: number;
}

/** Fração de loci-alvo em homozigose. */
export function targetHomozygosity(genotype: Genotype, targetLoci: string[]): number {
  if (targetLoci.length === 0) return 0;
  let homo = 0;
  for (const locus of targetLoci) {
    const pair = genotype.loci[locus];
    if (pair && baseAllele(pair[0]) === baseAllele(pair[1])) homo++;
  }
  return homo / targetLoci.length;
}

export function fixationIndex(input: FixationInput): FixationResult {
  const hTarget = targetHomozygosity(input.genotype, input.targetLoci);
  const gPedigree = Math.min(1, input.fPedigree / 0.25);
  const sGenerations = Math.min(1, input.generationsUnderSelection / 7);
  const index = 0.5 * hTarget + 0.3 * gPedigree + 0.2 * sGenerations;
  return {
    index: Number(index.toFixed(6)),
    hTarget: Number(hTarget.toFixed(6)),
    gPedigree: Number(gPedigree.toFixed(6)),
    sGenerations: Number(sGenerations.toFixed(6)),
  };
}

/** Mapeia IF → Aura de 1 a 5 estrelas (TDD §4.3). */
export function mapFixationToAura(index: number): Aura {
  if (index < 0.25) return 1;
  if (index < 0.5) return 2;
  if (index < 0.75) return 3;
  if (index < 0.9) return 4;
  return 5;
}
