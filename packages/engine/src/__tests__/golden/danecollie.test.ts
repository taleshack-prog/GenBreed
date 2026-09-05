/**
 * GOLDEN TEST — Arco 3: Danecollie F3 (Omega II × Beta).
 *
 * Requisitos do TDD §4.5:
 *   - Reaparecimento de homozigoto recessivo não-merle (m/m) em EXATOS 25%
 *   - Identificação dos recombinantes Tau e Phi
 *   - Epistasia Harlequin (H) sobre Merle (M); letalidade de M/M (duplo-merle)
 */

import { describe, it, expect } from "vitest";
import {
  cross, punnettLocus, genotypeProbability, jointGenotypeProbability,
  expressPhenotype, CANINE_PACK,
} from "../../index";
import { OMEGA_II, DANECOLLIE_BETA, DANECOLLIE_PEDIGREE } from "../fixtures";

const O = OMEGA_II.loci;
const B = DANECOLLIE_BETA.loci;
const omega = { id: "omegaII", genotype: OMEGA_II, generation: 2 };
const beta = { id: "beta", genotype: DANECOLLIE_BETA, generation: 1 };
const ctx = {
  pack: CANINE_PACK,
  pedigree: DANECOLLIE_PEDIGREE,
  interspecific: false,
  targetLoci: ["M", "A"],
  generationsUnderSelection: 3,
};

describe("Danecollie F3 (Omega II × Beta)", () => {
  it("m/m reaparece em EXATOS 25% (M/m × M/m)", () => {
    expect(genotypeProbability(O.M!, B.M!, "m/m")).toBe(0.25);
  });

  it("distribuição do loco Merle: 1 M/M : 2 M/m : 1 m/m", () => {
    const dist = punnettLocus(O.M!, B.M!);
    expect(dist.get("M/M")).toBe(0.25);
    expect(dist.get("M/m")).toBe(0.5);
    expect(dist.get("m/m")).toBe(0.25);
  });

  it("M/M (duplo-merle) é LETAL — embrião inviável", () => {
    const zygoteMM = {
      loci: { M: ["M", "M"] as [string, string], A: ["a", "a"] as [string, string] },
      qtl: {},
    };
    expect(expressPhenotype(zygoteMM, CANINE_PACK).viable).toBe(false);
  });

  it("epistasia: H presente + M presente → arlequim (fundo branco)", () => {
    const zygoteHM = {
      loci: { H: ["H", "h"] as [string, string], M: ["M", "m"] as [string, string] },
      qtl: {},
    };
    const ph = expressPhenotype(zygoteHM, CANINE_PACK);
    expect(ph.epistasis).toContain("harlequin-sobre-merle");
    expect(ph.loci.M).toContain("arlequim");
  });

  it("recombinantes raros Tau e Phi têm probabilidade conjunta exata", () => {
    // Tau: arlequim puro sem tan {H/h, M/m, a/a} = ½·½·½
    expect(jointGenotypeProbability(O, B, { H: "H/h", M: "M/m", A: "a/a" })).toBe(0.125);
    // Phi: merle piebald sem tan {M/m, a/a, s^p/s^p} = ½·½·¼
    expect(jointGenotypeProbability(O, B, { M: "M/m", A: "a/a", S: "s^p/s^p" })).toBe(0.0625);
  });

  it("determinismo: mesma seed → mesmo resultado", () => {
    const a = cross(omega, beta, "F3", "danecollie-01", ctx);
    const b = cross(omega, beta, "F3", "danecollie-01", ctx);
    expect(a).toEqual(b);
  });
});
