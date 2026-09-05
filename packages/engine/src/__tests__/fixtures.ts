/**
 * Fixtures dos 4 arcos do Gene-Bank para os golden tests.
 *
 * Genótipos e pedigrees derivados do Gene-Bank (docs/Gene-Bank.md) e dos
 * "Genótipos Alvo" do TDD §4.5. Ambiguidades de fundadores estão registradas
 * nos ADRs 0001–0004. Fundadores são não-endogâmicos e não-aparentados.
 */

import type { Genotype, Pedigree } from "../index";

// Vetor QTL neutro padrão (não afeta os testes discretos).
const QTL = { porte: 0.5, vigor: 0.5, beleza: 0.5, temperamento: 0.5 };

// ─── ARCO 1 — GOLDENDOODLE (Golden × Poodle) ─────────────────────────────────
// ADR-0001: curl F com dominância incompleta; F/F cacheado só surge na F2, não
// na F1 (f/f × F/F → 100% F/f ondulado). Cor segrega na F1 (C/c^ch × c^ch/c^ch).

export const GOLDEN_RETRIEVER: Genotype = {
  loci: {
    F: ["f", "f"],          // liso
    C: ["C", "c^ch"],       // dourado, portador de creme
    E: ["E", "E"],
    K: ["k^y", "k^y"],
    B: ["B", "B"],
  },
  qtl: QTL,
};

export const POODLE: Genotype = {
  loci: {
    F: ["F", "F"],          // cacheado
    C: ["c^ch", "c^ch"],    // creme
    E: ["e", "e"],
    K: ["k^y", "k^y"],
    B: ["B", "b"],
  },
  qtl: QTL,
};

export const GOLDENDOODLE_PEDIGREE: Pedigree = {
  golden: { id: "golden", sire: null, dam: null },
  poodle: { id: "poodle", sire: null, dam: null },
};

// ─── ARCO 2 — BOERPOINTER (Boerboel × Braço Alemão) ──────────────────────────
// F1 Alpha e Beta são irmãos completos (mesmos fundadores) → F2 com F=0.25.

export const BOERBOEL: Genotype = {
  loci: {
    B: ["B", "B"],
    K: ["K^br", "K^br"],    // brindle
    A: ["A^y", "A^y"],      // fulvo
    E: ["E", "E"],
    R: ["r", "r"],
    S: ["S", "S"],
  },
  qtl: QTL,
};

export const BRACO_ALEMAO: Genotype = {
  loci: {
    B: ["b", "b"],          // liver
    K: ["k^y", "k^y"],
    A: ["a", "a"],
    E: ["E", "e"],
    R: ["R", "R"],          // roan
    S: ["s^p", "s^p"],      // piebald (perdigueiro)
  },
  qtl: QTL,
};

// Genótipo dos irmãos F1 (Alpha ≡ Beta): heterozigotos nos loci segregantes.
export const BOERPOINTER_F1: Genotype = {
  loci: {
    B: ["B", "b"],
    K: ["K^br", "k^y"],
    A: ["A^y", "a"],
    E: ["E", "e"],
    R: ["R", "r"],
    S: ["S", "s^p"],
  },
  qtl: QTL,
};

export const BOERPOINTER_PEDIGREE: Pedigree = {
  boerboel: { id: "boerboel", sire: null, dam: null },
  braco: { id: "braco", sire: null, dam: null },
  alpha: { id: "alpha", sire: "boerboel", dam: "braco" },
  beta: { id: "beta", sire: "boerboel", dam: "braco" },
};

// ─── ARCO 3 — DANECOLLIE (Dogue Arlequim × Collie Tricolor) ──────────────────
// Foco: reaparecimento de m/m em 25% (M/m × M/m) e recombinantes Tau/Phi.

export const OMEGA_II: Genotype = {
  loci: {
    H: ["H", "h"],
    M: ["M", "m"],
    A: ["a^t", "a"],
    S: ["S", "s^p"],
  },
  qtl: QTL,
};

export const DANECOLLIE_BETA: Genotype = {
  loci: {
    H: ["h", "h"],
    M: ["M", "m"],
    A: ["a", "a"],
    S: ["S", "s^p"],
  },
  qtl: QTL,
};

// Pedigree ilustrativo do arco F3 (ADR-0003). Omega II e Beta descendem de um
// tronco Danecollie comum (Dogue P1 × Collie P2), tornando-os aparentados.
export const DANECOLLIE_PEDIGREE: Pedigree = {
  dogue: { id: "dogue", sire: null, dam: null },
  collie: { id: "collie", sire: null, dam: null },
  gamma: { id: "gamma", sire: "dogue", dam: "collie" },
  omega1: { id: "omega1", sire: "dogue", dam: "collie" },
  omegaII: { id: "omegaII", sire: "gamma", dam: "omega1" },
  beta: { id: "beta", sire: "dogue", dam: "collie" },
};

// ─── ARCO 4 — PUMAJAGUAR (Onça Parda × Onça Negra) ───────────────────────────
// Melanismo = A dominante; fulvo = aa. Onça Negra é Aa (F1 mostra aa e Aa).
// BC1 = Delta (Aa) × Onça Negra (Aa) → retrocruzamento ao pai preto.

export const ONCA_PARDA: Genotype = {
  loci: { A: ["a", "a"] },     // fulvo (Puma)
  qtl: { porte: 0.6, vigor: 0.6, beleza: 0.5, rosetas: 0.3 },
};

export const ONCA_NEGRA: Genotype = {
  loci: { A: ["A", "a"] },     // melanístico heterozigoto (Panthera)
  qtl: { porte: 0.7, vigor: 0.6, beleza: 0.6, rosetas: 0.7 },
};

export const DELTA_F1: Genotype = {
  loci: { A: ["A", "a"] },     // F1 melanístico (Aa)
  qtl: { porte: 0.65, vigor: 0.6, beleza: 0.55, rosetas: 0.5 },
};

export const PUMAJAGUAR_PEDIGREE: Pedigree = {
  puma: { id: "puma", sire: null, dam: null },
  negra: { id: "negra", sire: null, dam: null },
  delta: { id: "delta", sire: "puma", dam: "negra" },
};
