/**
 * Data pack CANINO — loci, alelos e regras derivados ESTRITAMENTE do Gene-Bank
 * (docs/Gene-Bank.md, cruzamentos 1–3: Goldendoodle, Boerpointer, Danecollie).
 *
 * Nada aqui é inventado: cada loco/alelo aparece nas tabelas de genótipo do
 * Gene-Bank ou nos "Genótipos Alvo" do TDD §4.5. Decisões de ambiguidade
 * (ex.: hierarquia de dominância não explicitada) estão registradas em ADRs.
 */

import { DEFAULT_MUTATION_RATE } from "@genbreedai/shared";
import type { SpeciesPack } from "../types";

const µ = DEFAULT_MUTATION_RATE;

export const CANINE_PACK: SpeciesPack = {
  id: "pack-canine-v1",
  slug: "canino-base",
  archetype: "CANINO",
  loci: {
    // Loco B — pigmento eumelanínico preto vs. liver/chocolate (Gene-Bank 3.7).
    B: {
      name: "B",
      alleles: ["B", "b"],
      dominance: "COMPLETE",
      dominanceRank: ["B", "b"],
      phenotypeByAllele: { B: "preto/roan", b: "liver/chocolate" },
      mutationRate: µ,
    },
    // Loco K — brindle (K^br) vs. permite expressão agouti (k^y) (Gene-Bank 3.4/3.7).
    K: {
      name: "K",
      alleles: ["K^br", "k^y"],
      dominance: "COMPLETE",
      dominanceRank: ["K^br", "k^y"],
      phenotypeByAllele: { "K^br": "brindle/tigrado", "k^y": "permite-agouti" },
      mutationRate: µ,
    },
    // Loco A (Agouti) — fulvo (A^y) > tan points (a^t) > não-agouti (a).
    // Hierarquia clássica; ver ADR-0002. (Gene-Bank 3.5, 4.2/4.3, 5.x)
    A: {
      name: "A",
      alleles: ["A^y", "a^t", "a"],
      dominance: "COMPLETE",
      dominanceRank: ["A^y", "a^t", "a"],
      phenotypeByAllele: {
        "A^y": "fulvo/sable",
        "a^t": "tan-points",
        a: "não-agouti",
      },
      mutationRate: µ,
    },
    // Loco E (Extension) — E permite eumelanina; e/e = creme/vermelho recessivo.
    // (Boerpointer Omega e/e; Goldendoodle E/e — TDD §4.5)
    E: {
      name: "E",
      alleles: ["E", "e"],
      dominance: "COMPLETE",
      dominanceRank: ["E", "e"],
      phenotypeByAllele: { E: "extensão-normal", e: "creme/vermelho" },
      mutationRate: µ,
    },
    // Loco S (White spotting) — sólido (S) > piebald (s^p) (Gene-Bank glossário).
    S: {
      name: "S",
      alleles: ["S", "s^p"],
      dominance: "COMPLETE",
      dominanceRank: ["S", "s^p"],
      phenotypeByAllele: { S: "sólido", "s^p": "piebald" },
      mutationRate: µ,
    },
    // Loco R (Roan) — roan (R) dominante; r ausência. (Boerpointer 3.4)
    R: {
      name: "R",
      alleles: ["R", "r"],
      dominance: "COMPLETE",
      dominanceRank: ["R", "r"],
      phenotypeByAllele: { R: "roan", r: "sem-roan" },
      mutationRate: µ,
    },
    // Loco F (Curl/queratina) — textura de pelo, DOMINÂNCIA INCOMPLETA.
    // F/F cacheado; F/f ondulado; f/f liso. (TDD §4.5 Goldendoodle; ver ADR-0001)
    F: {
      name: "F",
      alleles: ["F", "f"],
      dominance: "INCOMPLETE",
      dominanceRank: ["F", "f"],
      phenotypeByAllele: { F: "cacheado", f: "liso" },
      heteroPhenotype: { "F|f": "ondulado" },
      mutationRate: µ,
    },
    // Loco C (Intensidade/chinchila) — c^ch dilui feomelanina para creme.
    // (TDD §4.5 Goldendoodle: c^ch/c^ch)
    C: {
      name: "C",
      alleles: ["C", "c^ch"],
      dominance: "INCOMPLETE",
      dominanceRank: ["C", "c^ch"],
      phenotypeByAllele: { C: "pigmento-pleno", "c^ch": "creme" },
      heteroPhenotype: { "C|c^ch": "creme-parcial" },
      mutationRate: µ,
    },
    // Loco M (Merle) — DOMINÂNCIA INCOMPLETA. M/M é LETAL (duplo-merle).
    // (Danecollie 4.x; glossário Merle)
    M: {
      name: "M",
      alleles: ["M", "m"],
      dominance: "INCOMPLETE",
      dominanceRank: ["M", "m"],
      phenotypeByAllele: { M: "merle-duplo", m: "não-merle" },
      heteroPhenotype: { "M|m": "merle" },
      mutationRate: µ,
    },
    // Loco H (Harlequin) — modificador epistático sobre M. h/h sem efeito.
    // (Danecollie 4.5; glossário Harlequin)
    H: {
      name: "H",
      alleles: ["H", "h"],
      dominance: "COMPLETE",
      dominanceRank: ["H", "h"],
      phenotypeByAllele: { H: "portador-harlequin", h: "sem-harlequin" },
      mutationRate: µ,
    },
  },
  epistasis: [
    // Harlequin (H) converte manchas merle (M) em branco. (TDD §4.1; Gene-Bank 4.5)
    {
      modifierLocus: "H",
      whenAllelePresent: "H",
      targetLocus: "M",
      targetWhenAllelePresent: "M",
      override: "arlequim (fundo branco, manchas)",
      label: "harlequin-sobre-merle",
    },
  ],
  lethals: [
    // Duplo-merle M/M → mortalidade embrionária. (TDD §4.1)
    { locus: "M", genotype: ["M", "M"], label: "duplo-merle-letal" },
  ],
  quantitative: {
    porte: { mean: 0.5, h2: 0.5 },
    vigor: { mean: 0.5, h2: 0.35 },
    beleza: { mean: 0.5, h2: 0.25 },
    temperamento: { mean: 0.5, h2: 0.3 },
  },
};
