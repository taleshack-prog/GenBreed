# ADR-0002 — F de Wright real vs. F narrativo do Gene-Bank

- **Status:** aceito
- **Data:** 2026-09-05

## Contexto

O Gene-Bank atribui coeficientes `F` a cada cruzamento (ex.: F2 = 0.10, BC1 =
0.03, Inbreeding = 0.15–0.25). O TDD §4.5, porém, exige valores diferentes para
os mesmos cruzamentos nos golden tests:

| Cruzamento | F narrativo (Gene-Bank) | F de Wright (TDD §4.5 / correto) |
|---|---|---|
| F2 (irmãos completos) | 0.10 | **0.25** |
| BC1 (retrocruzamento ao pai) | 0.03 | **0.25** |

Recalculando de forma independente pelo método de coancestria (Wright 1922;
Falconer & Mackay 1996):

- Prole de **irmãos completos**: `F = f(pai, mãe) = 0.25`.
- Prole de **retrocruzamento pai×filho(a)**: `F = 0.25`.

Ou seja, os valores narrativos do Gene-Bank estão **incorretos** como
coeficiente de endogamia de Wright. Eles se comportam mais como uma métrica de
"acumulação de homozigose percebida" — próxima em espírito do **IF** de jogo,
não do `F_pedigree` biológico.

## Decisão

1. O motor calcula **sempre o F de Wright real** via coancestria recursiva
   (`packages/engine/src/wright.ts`).
2. Os golden tests travam os valores **do TDD §4.5** (0.00, 0.25, 0.25), que
   coincidem com o cálculo independente.
3. Os valores `F` do Gene-Bank são tratados como **anotações narrativas** e
   sinalizados na auditoria (severidade maior) para revisão editorial.
4. Reforça-se a separação **`F_pedigree` (biologia) × `IF` (jogo)** exigida pelo
   TDD §4.3: alertas de depressão/esterilidade usam `F_pedigree`; rank/aura usam
   `IF`.

## Consequências

- Fidelidade científica garantida; alertas de depressão endogâmica disparam nos
  limiares corretos (F > 0.15 e F > 0.25).
- O documento Gene-Bank precisa de errata editorial (não bloqueia a Fase 0).

## Alternativas consideradas

- **Usar o F narrativo (0.10/0.03)**: rejeitada — quebra Haldane/depressão e
  contradiz o próprio TDD §4.5; homologaria erro por precedência.
