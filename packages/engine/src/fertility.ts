/**
 * Dinâmica de fertilidade e viabilidade (TDD §4.2).
 *
 * Base por método:
 *   - Intraespécie (F1 intra, LINE, INBREED, OUTCROSS): 100
 *   - F1 interespecífico: 0 no sexo heterogamético (Regra de Haldane)
 *   - BC1: 60–80   ·   F2: 30–50
 * Modificadores:
 *   - F_pedigree > 0.15 → −10% da base por 0.05 adicional (depressão endogâmica)
 *   - F_pedigree > 0.25 → risco de óbito embrionário ≥ 5%
 *   - OUTCROSS → bônus de heterose de +40% a +60%
 *
 * Determinismo: valores dentro de faixas são resolvidos por PRNG semeado.
 */

import type { BreedingMethod, FertilityResult } from "@genbreedai/shared";
import type { Rng } from "./rng";

export interface FertilityOptions {
  /** True quando o cruzamento é entre espécies distintas (aciona Haldane em F1). */
  interspecific: boolean;
  /** PRNG determinístico para resolver faixas (BC1/F2/outcross). */
  rng: Rng;
}

/** Resolve um valor determinístico dentro de [min, max] usando o PRNG. */
function withinRange(rng: Rng, min: number, max: number): number {
  return min + rng.next() * (max - min);
}

export function fertilityScore(
  method: BreedingMethod,
  fPedigree: number,
  opts: FertilityOptions,
): FertilityResult {
  const notes: string[] = [];
  let base: number;
  let haldaneSterile = false;

  switch (method) {
    case "F1":
      if (opts.interspecific) {
        base = 0;
        haldaneSterile = true;
        notes.push("Regra de Haldane: sexo heterogamético estéril em F1 interespecífico.");
      } else {
        base = 100;
        notes.push("Cruzamento intraespécie basal: fertilidade 100.");
      }
      break;
    case "BC1":
      base = withinRange(opts.rng, 60, 80);
      notes.push("BC1 (retrocruzamento): fertilidade 60–80.");
      break;
    case "F2":
      base = withinRange(opts.rng, 30, 50);
      notes.push("F2 (intercruzamento): fertilidade 30–50.");
      break;
    case "OUTCROSS": {
      base = 100;
      const bonus = withinRange(opts.rng, 0.4, 0.6);
      base = Math.min(100, base * (1 + bonus)); // heterose sobre base, teto 100
      notes.push(`Outcross de resgate: +${(bonus * 100).toFixed(0)}% de heterose.`);
      break;
    }
    case "F3":
    case "LINE":
    case "INBREED":
    default:
      base = 100;
      notes.push("Base intraespécie: 100 (antes de modificadores de endogamia).");
      break;
  }

  // Depressão endogâmica (F > 0.15): −10% da base por 0.05 adicional.
  let score = base;
  if (fPedigree > 0.15) {
    const steps = (fPedigree - 0.15) / 0.05;
    const penalty = steps * 0.1;
    score = Math.max(0, base * (1 - penalty));
    notes.push(
      `Depressão endogâmica: F=${fPedigree.toFixed(3)} → penalidade ${(penalty * 100).toFixed(1)}%.`,
    );
  }

  // Inviabilidade embrionária (F > 0.25): risco ≥ 5%.
  let inviabilityRisk = 0;
  if (fPedigree > 0.25) {
    // 5% no limiar, crescendo 5% adicional por 0.05 acima de 0.25 (conservador).
    const extra = ((fPedigree - 0.25) / 0.05) * 0.05;
    inviabilityRisk = Math.min(1, 0.05 + extra);
    notes.push(
      `Inviabilidade embrionária: F=${fPedigree.toFixed(3)} → risco ${(inviabilityRisk * 100).toFixed(1)}%.`,
    );
  }

  return {
    score: Number(score.toFixed(4)),
    inviabilityRisk: Number(inviabilityRisk.toFixed(4)),
    haldaneSterile,
    notes,
  };
}
