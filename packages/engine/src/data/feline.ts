/**
 * Data pack FELINO — arco Pumajaguar (Onça Parda × Onça Negra), Gene-Bank §5.
 *
 * Nota genética do Gene-Bank §5.1: em Panthera onca o melanismo é AUTOSSÔMICO
 * DOMINANTE (ganho de função em MC1R + deleção em ASIP); as rosetas persistem
 * como "marcas fantasma" sob a eumelanina. Modelamos:
 *   - Loco A: A = melanismo (dominante), a = fulvo/não-melânico (recessivo).
 *     A_ (AA ou Aa) = preto melanístico; a/a = fulvo. (Gene-Bank 5.2)
 * As rosetas são um padrão sempre presente (fenótipo modulado por QTL), não
 * suprimido pela eumelanina — por isso não há loco discreto de "rosetas".
 */

import { DEFAULT_MUTATION_RATE } from "@genbreedai/shared";
import type { SpeciesPack } from "../types";

const µ = DEFAULT_MUTATION_RATE;

export const FELINE_PACK: SpeciesPack = {
  id: "pack-feline-v1",
  slug: "felino-pantera",
  archetype: "FELINO",
  loci: {
    // Loco A — melanismo dominante (A) vs. fulvo recessivo (a). (Gene-Bank 5.1/5.2)
    A: {
      name: "A",
      alleles: ["A", "a"],
      dominance: "COMPLETE",
      dominanceRank: ["A", "a"],
      phenotypeByAllele: { A: "melanístico (preto)", a: "fulvo" },
      mutationRate: µ,
    },
  },
  epistasis: [],
  lethals: [],
  quantitative: {
    porte: { mean: 0.5, h2: 0.5 },
    vigor: { mean: 0.5, h2: 0.35 },
    beleza: { mean: 0.5, h2: 0.25 },
    // "rosetas": intensidade do padrão de rosetas (marcas fantasma). h² alto.
    rosetas: { mean: 0.5, h2: 0.6 },
  },
};
