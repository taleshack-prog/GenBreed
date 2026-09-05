/**
 * Testes unitários das primitivas do motor (TDD §4).
 */

import { describe, it, expect } from "vitest";
import {
  createPrng, wrightF, kinship, fStatistic, sha256, fixationIndex,
  mapFixationToAura, fertilityScore, gameteFrequencies, expressPhenotype,
  CANINE_PACK,
} from "../index";

describe("PRNG determinístico", () => {
  it("mesma seed → mesma sequência", () => {
    const a = createPrng("x");
    const b = createPrng("x");
    const sa = [a.next(), a.next(), a.next()];
    const sb = [b.next(), b.next(), b.next()];
    expect(sa).toEqual(sb);
  });
  it("seeds distintas → sequências distintas", () => {
    const a = createPrng("x").next();
    const b = createPrng("y").next();
    expect(a).not.toBe(b);
  });
  it("next() ∈ [0,1)", () => {
    const r = createPrng("z");
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("F de Wright (coancestria)", () => {
  const ped = {
    p1: { id: "p1", sire: null, dam: null },
    p2: { id: "p2", sire: null, dam: null },
    s1: { id: "s1", sire: "p1", dam: "p2" },
    s2: { id: "s2", sire: "p1", dam: "p2" },
    child: { id: "child", sire: "p1", dam: "s1" }, // pai × filha
  };
  it("fundadores não aparentados → F = 0", () => {
    expect(wrightF(ped, "p1", "p2")).toBe(0);
  });
  it("prole de irmãos completos → F = 0.25", () => {
    expect(wrightF(ped, "s1", "s2")).toBe(0.25);
  });
  it("prole de pai × filha → F = 0.25", () => {
    expect(wrightF(ped, "p1", "s1")).toBe(0.25);
  });
  it("kinship(x,x) = 0.5 para fundador não-endogâmico", () => {
    expect(kinship(ped, "p1", "p1")).toBe(0.5);
  });
});

describe("Estatística F (déficit de heterozigose)", () => {
  it("F = 1 − H_obs/H_exp", () => {
    expect(fStatistic(0.3, 0.5)).toBeCloseTo(0.4, 10);
    expect(fStatistic(0.5, 0.5)).toBe(0);
  });
});

describe("Índice de Fixação e Auras", () => {
  it("IF composto conforme fórmula do TDD §4.3", () => {
    const r = fixationIndex({
      genotype: { loci: { A: ["A", "A"], B: ["B", "b"] }, qtl: {} },
      targetLoci: ["A", "B"],
      fPedigree: 0.25,
      generationsUnderSelection: 7,
    });
    // H=0.5, G=1.0, S=1.0 → 0.25 + 0.3 + 0.2 = 0.75
    expect(r.index).toBeCloseTo(0.75, 10);
  });
  it("mapeamento de auras", () => {
    expect(mapFixationToAura(0.1)).toBe(1);
    expect(mapFixationToAura(0.3)).toBe(2);
    expect(mapFixationToAura(0.6)).toBe(3);
    expect(mapFixationToAura(0.8)).toBe(4);
    expect(mapFixationToAura(0.95)).toBe(5);
  });
});

describe("Fertilidade (TDD §4.2)", () => {
  const rng = createPrng("fert");
  it("F1 interespecífico → Haldane (score 0, estéril)", () => {
    const r = fertilityScore("F1", 0, { interspecific: true, rng });
    expect(r.score).toBe(0);
    expect(r.haldaneSterile).toBe(true);
  });
  it("F1 intraespécie → 100", () => {
    const r = fertilityScore("F1", 0, { interspecific: false, rng });
    expect(r.score).toBe(100);
  });
  it("depressão endogâmica: F=0.25 reduz base em 20%", () => {
    const r = fertilityScore("LINE", 0.25, { interspecific: false, rng });
    expect(r.score).toBeCloseTo(80, 6); // 100 × (1 − 0.20)
  });
  it("inviabilidade embrionária: F>0.25 → risco ≥ 5%", () => {
    const r = fertilityScore("INBREED", 0.30, { interspecific: false, rng });
    expect(r.inviabilityRisk).toBeGreaterThanOrEqual(0.05);
  });
});

describe("Frequências gaméticas", () => {
  it("homozigoto → 1 alelo com p=1", () => {
    expect([...gameteFrequencies(["A", "A"])]).toEqual([["A", 1]]);
  });
  it("heterozigoto → 2 alelos com p=0.5", () => {
    const m = gameteFrequencies(["A", "a"]);
    expect(m.get("A")).toBe(0.5);
    expect(m.get("a")).toBe(0.5);
  });
});

describe("SHA-256 (vetores de teste FIPS)", () => {
  it("string vazia", () => {
    expect(sha256("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });
  it('"abc"', () => {
    expect(sha256("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});

describe("Expressão fenotípica — dominância incompleta (M)", () => {
  it("M/m → merle; m/m → não-merle", () => {
    const merle = expressPhenotype({ loci: { M: ["M", "m"] }, qtl: {} }, CANINE_PACK);
    expect(merle.loci.M).toBe("merle");
    const nonmerle = expressPhenotype({ loci: { M: ["m", "m"] }, qtl: {} }, CANINE_PACK);
    expect(nonmerle.loci.M).toBe("não-merle");
  });
});
