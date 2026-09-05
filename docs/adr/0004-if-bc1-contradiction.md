# ADR-0004 — Contradição do "IF ≈ 0.03" na BC1 do Pumajaguar

- **Status:** aceito
- **Data:** 2026-09-05

## Contexto

O TDD §4.5 (Pumajaguar BC1) anota simultaneamente `F_pedigree = 0.25` e
`IF ≈ 0.03`. Pela fórmula do próprio TDD §4.3:

```
IF = 0.5·H_alvo + 0.3·G_pedigree + 0.2·S_gerações
G_pedigree = min(1, F_pedigree / 0.25) = min(1, 0.25/0.25) = 1.0
```

O termo `0.3 × G_pedigree = 0.3 × 1.0 = 0.30` **sozinho** já garante `IF ≥ 0.30`.
Logo, `IF ≈ 0.03` é **matematicamente impossível** quando `F_pedigree = 0.25`.
O valor `0.03` coincide com o `F` narrativo da BC1 no Gene-Bank (§5.3) — é um
**vazamento** desse número para a coluna do IF.

## Decisão

1. O motor calcula o IF **estritamente pela fórmula** do TDD §4.3.
2. O golden test trava `IF ≥ 0.30` para a BC1 (resultado correto), com o valor
   determinístico observado ≈ 0.357 para a prole heterozigota semeada.
3. A anotação "IF ≈ 0.03" é registrada como **achado CRÍTICO** na auditoria, para
   correção editorial do TDD/Gene-Bank.
4. Mantém-se `F_pedigree = 0.25` (biologicamente correto para retrocruzamento ao
   progenitor — ADR-0002).

## Consequências

- IF e `F_pedigree` permanecem métricas distintas e coerentes (TDD §4.3).
- O TDD requer errata na coluna de IF do arco Pumajaguar.

## Alternativas consideradas

- **Ajustar a fórmula do IF para caber 0.03**: rejeitada — a fórmula é fonte de
  verdade e imutável; distorcê-la para um único arco quebraria todos os demais e
  a semântica das auras.
- **Zerar G_pedigree na BC1**: rejeitada — `F_pedigree = 0.25` é real; ignorá-lo
  no IF violaria a definição de `G_pedigree`.
