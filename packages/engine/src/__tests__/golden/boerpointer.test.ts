/**
 * GOLDEN TEST — Arco 2: Boerpointer F2 (Alpha × Beta, irmãos completos F1).
 *
 * Requisitos do TDD §4.5:
 *   - F_pedigree = 0.25 (prole de irmãos completos)
 *   - Segregação clássica 3:1 nos dominantes
 *   - Reaparecimento de homozigotos recessivos
 *
 * Achado científico (audit): o Gene-Bank §3 narra "F: 0.10" para a F2. O valor
 * biologicamente correto de Wright para prole de irmãos completos é 0.25 — o
 * TDD §4.5 confirma 0.25. O teste trava 0.25 (F_pedigree real).
 */

import { describe, it, expect } from "vitest";
import {
  cross, punnettPhenotypeLocus, genotypeProbability, jointGenotypeProbability,
  wrightF, CANINE_PACK,
} from "../../index";
import { BOERPOINTER_F1, BOERPOINTER_PEDIGREE } from "../fixtures";

const L = BOERPOINTER_F1.loci;
const alpha = { id: "alpha", genotype: BOERPOINTER_F1, generation: 1 };
const beta = { id: "beta", genotype: BOERPOINTER_F1, generation: 1 };
const ctx = {
  pack: CANINE_PACK,
  pedigree: BOERPOINTER_PEDIGREE,
  interspecific: false,
  targetLoci: ["B", "K", "A"],
  generationsUnderSelection: 2,
};

describe("Boerpointer F2 (Alpha × Beta irmãos)", () => {
  it("F_pedigree = 0.25 (prole de irmãos completos)", () => {
    expect(wrightF(BOERPOINTER_PEDIGREE, "alpha", "beta")).toBe(0.25);
  });

  it("segregação 3:1 no loco B (dominante : recessivo)", () => {
    const dist = punnettPhenotypeLocus(CANINE_PACK.loci.B!, L.B!, L.B!);
    expect(dist.get("preto/roan")).toBe(0.75);
    expect(dist.get("liver/chocolate")).toBe(0.25);
  });

  it("homozigotos recessivos reaparecem em 25% (B, K, A)", () => {
    expect(genotypeProbability(L.B!, L.B!, "b/b")).toBe(0.25);
    expect(genotypeProbability(L.K!, L.K!, "k^y/k^y")).toBe(0.25);
    expect(genotypeProbability(L.A!, L.A!, "a/a")).toBe(0.25);
  });

  it("6 genótipos documentados têm probabilidade conjunta não-nula", () => {
    // Amostras das 6 classes documentadas no Gene-Bank §3.5.
    expect(jointGenotypeProbability(L, L, { B: "B/B", R: "R/r", K: "k^y/k^y" })).toBeGreaterThan(0); // Alpha II
    expect(jointGenotypeProbability(L, L, { E: "e/e", A: "a/a" })).toBeGreaterThan(0);               // Omega II
    expect(jointGenotypeProbability(L, L, { S: "s^p/s^p", B: "B/b" })).toBe(0.25 * 0.5);             // Gamma II piebald
  });

  it("cross() F2: F_pedigree = 0.25 e fertilidade sob depressão (F>0.15)", () => {
    const r = cross(alpha, beta, "F2", "boerpointer-01", ctx);
    expect(r.specimen.fPedigree).toBe(0.25);
    // F2 base 30–50, com F=0.25 aplica-se 20% de depressão → <= 50.
    expect(r.specimen.fertility.score).toBeLessThanOrEqual(50);
    expect(r.specimen.phenotype.viable).toBe(true);
  });

  it("determinismo: mesma seed → mesmo resultado", () => {
    const a = cross(alpha, beta, "F2", "boerpointer-01", ctx);
    const b = cross(alpha, beta, "F2", "boerpointer-01", ctx);
    expect(a).toEqual(b);
  });
});
