/**
 * Resolução fenotípica (TDD §4.1 / §4.4, passo 4).
 *
 * Ordem de resolução:
 *   1. Letalidade (ex.: M/M duplo-merle) → viable = false.
 *   2. Dominância por loco (COMPLETE / INCOMPLETE / CODOMINANT).
 *   3. Epistasia (ex.: Harlequin H sobre Merle M).
 */

import type { Genotype, Phenotype } from "@genbreedai/shared";
import type { LocusDef, SpeciesPack } from "./types";
import { baseAllele, isMutant } from "./gamete";

/** Chave de heterozigoto normalizada, ex.: ("F","f") → "F|f" pela ordem do rank. */
function heteroKey(def: LocusDef, a: string, b: string): string {
  const ra = def.dominanceRank.indexOf(a);
  const rb = def.dominanceRank.indexOf(b);
  const [hi, lo] = ra <= rb ? [a, b] : [b, a];
  return `${hi}|${lo}`;
}

/** Resolve o descritor de UM loco isolado (sem epistasia). */
function expressLocus(def: LocusDef, rawA: string, rawB: string): string {
  const a = baseAllele(rawA);
  const b = baseAllele(rawB);

  if (a === b) {
    return def.phenotypeByAllele[a] ?? a;
  }

  if (def.dominance === "COMPLETE") {
    // O alelo de menor índice no rank domina.
    const ra = def.dominanceRank.indexOf(a);
    const rb = def.dominanceRank.indexOf(b);
    const dominant = ra <= rb ? a : b;
    return def.phenotypeByAllele[dominant] ?? dominant;
  }

  // INCOMPLETE ou CODOMINANT: heterozigoto tem descritor próprio.
  const key = heteroKey(def, a, b);
  const hetero = def.heteroPhenotype?.[key];
  if (hetero) return hetero;

  // Fallback conservador: codominância "a+b".
  return `${def.phenotypeByAllele[a] ?? a}+${def.phenotypeByAllele[b] ?? b}`;
}

/**
 * Expressa o fenótipo completo de um zigoto sob um data pack.
 */
export function expressPhenotype(
  zygote: Genotype,
  pack: SpeciesPack,
): Phenotype {
  // 1. Letalidade — qualquer combo letal inviabiliza o embrião.
  let viable = true;
  for (const lethal of pack.lethals) {
    const pair = zygote.loci[lethal.locus];
    if (!pair) continue;
    const [x, y] = [baseAllele(pair[0]), baseAllele(pair[1])];
    const [lx, ly] = lethal.genotype;
    const match =
      (x === lx && y === ly) || (x === ly && y === lx);
    if (match) viable = false;
  }

  // 2. Dominância por loco.
  const loci: Record<string, string> = {};
  for (const [locusName, pair] of Object.entries(zygote.loci)) {
    const def = pack.loci[locusName];
    if (!def) {
      loci[locusName] = `${pair[0]}/${pair[1]}`;
      continue;
    }
    loci[locusName] = expressLocus(def, pair[0], pair[1]);
  }

  // 3. Epistasia — sobrescreve o alvo quando o modificador está presente.
  const epistasis: string[] = [];
  for (const rule of pack.epistasis) {
    const modPair = zygote.loci[rule.modifierLocus];
    const tgtPair = zygote.loci[rule.targetLocus];
    if (!modPair || !tgtPair) continue;

    const modHas = modPair
      .map(baseAllele)
      .includes(rule.whenAllelePresent);
    const tgtHas =
      rule.targetWhenAllelePresent === undefined
        ? true
        : tgtPair.map(baseAllele).includes(rule.targetWhenAllelePresent);

    if (modHas && tgtHas) {
      loci[rule.targetLocus] = rule.override;
      epistasis.push(rule.label);
    }
  }

  // Mutação: presente se qualquer alelo do zigoto carrega o rótulo indelével.
  const hasMutation = Object.values(zygote.loci).some((pair) =>
    pair.some(isMutant),
  );

  return { loci, qtl: { ...zygote.qtl }, viable, epistasis, hasMutation };
}
