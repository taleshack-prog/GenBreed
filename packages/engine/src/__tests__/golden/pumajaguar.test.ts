/**
 * GOLDEN TEST — Arco 4: Pumajaguar BC1 (Delta F1 × Onça Negra).
 *
 * Requisitos do TDD §4.5:
 *   - Fixação de pelagem melânica (melanismo = A dominante)
 *   - F_pedigree = 0.25 (retrocruzamento ao progenitor)
 *   - IF ≈ 0.03 (ver ACHADO CRÍTICO abaixo)
 *
 * ACHADO CRÍTICO (audit / ADR-0004): o TDD anota "IF ≈ 0.03" para a BC1, mas
 * isso contradiz a PRÓPRIA fórmula do TDD §4.3: com F_pedigree = 0.25 tem-se
 * G_pedigree = min(1, 0.25/0.25) = 1.0, cujo peso 0.3 já garante IF ≥ 0.30.
 * O valor 0.03 é o F narrativo do Gene-Bank vazado na coluna do IF. O teste
 * trava o IF CORRETO pela fórmula (≥ 0.30), não o valor impossível.
 */

import { describe, it, expect } from "vitest";
import {
  cross, punnettLocus, genotypeProbability, wrightF, FELINE_PACK,
} from "../../index";
import { DELTA_F1, ONCA_NEGRA, PUMAJAGUAR_PEDIGREE } from "../fixtures";

const D = DELTA_F1.loci;
const N = ONCA_NEGRA.loci;
const delta = { id: "delta", genotype: DELTA_F1, generation: 1 };
const negra = { id: "negra", genotype: ONCA_NEGRA, generation: 0 };
const ctx = {
  pack: FELINE_PACK,
  pedigree: PUMAJAGUAR_PEDIGREE,
  interspecific: true,
  targetLoci: ["A"],
  generationsUnderSelection: 2,
};

describe("Pumajaguar BC1 (Delta × Onça Negra)", () => {
  it("F_pedigree = 0.25 (retrocruzamento ao progenitor)", () => {
    expect(wrightF(PUMAJAGUAR_PEDIGREE, "delta", "negra")).toBe(0.25);
  });

  it("fixação do melanismo: P(melanístico A_) = 0.75, P(AA fixado) = 0.25", () => {
    const dist = punnettLocus(D.A!, N.A!);
    expect(dist.get("A/A")).toBe(0.25);
    expect(dist.get("A/a")).toBe(0.5);
    expect(dist.get("a/a")).toBe(0.25);
    const melanistic =
      genotypeProbability(D.A!, N.A!, "A/A") + genotypeProbability(D.A!, N.A!, "A/a");
    expect(melanistic).toBe(0.75);
  });

  it("IF corrigido: ≥ 0.30 (o 'IF ≈ 0.03' do TDD é impossível — ver ADR-0004)", () => {
    const r = cross(delta, negra, "BC1", "pumajaguar-01", ctx);
    // G_pedigree = 1.0 (F=0.25) → contribuição fixa de 0.3 no IF.
    expect(r.specimen.fixationIndex).toBeGreaterThanOrEqual(0.3);
  });

  it("fertilidade BC1 (60–80) sob depressão endogâmica (F=0.25 → −20%)", () => {
    const r = cross(delta, negra, "BC1", "pumajaguar-01", ctx);
    // base ∈ [60,80]; após −20% de depressão → [48,64].
    expect(r.specimen.fertility.score).toBeGreaterThanOrEqual(48);
    expect(r.specimen.fertility.score).toBeLessThanOrEqual(64);
    // F = 0.25 NÃO é > 0.25 → sem risco de inviabilidade.
    expect(r.specimen.fertility.inviabilityRisk).toBe(0);
    // BC1 não aciona esterilidade de Haldane (exclusiva de F1).
    expect(r.specimen.fertility.haldaneSterile).toBe(false);
  });

  it("determinismo: mesma seed → mesmo resultado", () => {
    const a = cross(delta, negra, "BC1", "pumajaguar-01", ctx);
    const b = cross(delta, negra, "BC1", "pumajaguar-01", ctx);
    expect(a).toEqual(b);
    expect(a.cacheKey).toBe(b.cacheKey);
  });
});
