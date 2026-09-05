/**
 * GOLDEN TEST — Arco 1: Goldendoodle F1 (Golden Retriever × Poodle).
 *
 * Requisitos do TDD §4.5:
 *   - F_pedigree = 0.00 (progenitores não aparentados)
 *   - IF ≈ 0.05 (Aura ★ — híbrido primário)
 *   - Segregação de textura/cor na F1
 *
 * Achado científico (ver docs/audit/fase0-audit.md, ADR-0001): o Gene-Bank §2
 * descreve DUAS texturas na F1 (ondulado F/f e cacheado F/F). Isso é
 * biologicamente impossível a partir de f/f × F/F puros — a F1 é 100% F/f
 * (ondulado); F/F só reaparece na F2. O teste trava o resultado CORRETO.
 */

import { describe, it, expect } from "vitest";
import {
  cross, punnettPhenotypeLocus, wrightF, CANINE_PACK,
} from "../../index";
import {
  GOLDEN_RETRIEVER, POODLE, GOLDENDOODLE_PEDIGREE,
} from "../fixtures";

const parentA = { id: "golden", genotype: GOLDEN_RETRIEVER, generation: 0 };
const parentB = { id: "poodle", genotype: POODLE, generation: 0 };
const ctx = {
  pack: CANINE_PACK,
  pedigree: GOLDENDOODLE_PEDIGREE,
  interspecific: false,
  // Alvo de introgressão do F1: a textura de pelo (loco F). ADR-0001.
  targetLoci: ["F"],
  generationsUnderSelection: 1,
};

describe("Goldendoodle F1 (Golden × Poodle)", () => {
  it("F_pedigree = 0.00 (progenitores não aparentados)", () => {
    expect(wrightF(GOLDENDOODLE_PEDIGREE, "golden", "poodle")).toBe(0);
  });

  it("textura F1: 100% ondulado (F/f) — F/F NÃO ocorre na F1", () => {
    const dist = punnettPhenotypeLocus(
      CANINE_PACK.loci.F!, GOLDEN_RETRIEVER.loci.F!, POODLE.loci.F!,
    );
    expect(dist.get("ondulado")).toBe(1);
    expect(dist.get("cacheado")).toBeUndefined();
    expect(dist.get("liso")).toBeUndefined();
  });

  it("cor F1 segrega 1:1 (creme × creme-parcial)", () => {
    const dist = punnettPhenotypeLocus(
      CANINE_PACK.loci.C!, GOLDEN_RETRIEVER.loci.C!, POODLE.loci.C!,
    );
    expect(dist.get("creme")).toBe(0.5);
    expect(dist.get("creme-parcial")).toBe(0.5);
  });

  it("cross() é fértil, viável e Aura ★ (IF < 0.10)", () => {
    const r = cross(parentA, parentB, "F1", "goldendoodle-01", ctx);
    expect(r.specimen.phenotype.viable).toBe(true);
    expect(r.specimen.fertility.score).toBe(100);
    expect(r.specimen.aura).toBe(1);
    expect(r.specimen.fixationIndex).toBeLessThan(0.1);
    expect(r.specimen.fPedigree).toBe(0);
  });

  it("determinismo: mesma seed → mesmo resultado", () => {
    const a = cross(parentA, parentB, "F1", "goldendoodle-01", ctx);
    const b = cross(parentA, parentB, "F1", "goldendoodle-01", ctx);
    expect(a).toEqual(b);
    expect(a.cacheKey).toBe(b.cacheKey);
  });
});
