# ADR-0003 — Pedigree construído do arco Danecollie (F3)

- **Status:** aceito
- **Data:** 2026-09-05

## Contexto

O TDD §4.5 (Danecollie F3) exige o reaparecimento de `m/m` em **exatos 25%** e a
identificação dos recombinantes **Tau** e **Phi**, mas **não fornece** um valor
de `F_pedigree` nem os genótipos completos dos fundadores. O Gene-Bank narra
`F: 0.15` (valor narrativo — ver ADR-0002).

## Decisão

1. O requisito travado no golden test é o do TDD: `P(m/m) = 0.25` (cruzamento
   `M/m × M/m`), a letalidade de `M/M` (duplo-merle) e a epistasia Harlequin.
2. Genótipos: `Omega II = H/h, M/m, a^t/a, S/s^p`; `Beta = h/h, M/m, a/a, S/s^p`
   — derivados das tabelas de "genótipo demonstrado" do Gene-Bank §4.
3. Recombinantes: `Tau (H/h, M/m, a/a) = 0.125`; `Phi (M/m, a/a, s^p/s^p) =
   0.0625` — probabilidades conjuntas exatas (montagem independente).
4. O pedigree de linhagem (`docs`/fixtures) é **construído** para tornar Omega II
   e Beta aparentados por um tronco comum; o `F_pedigree` resultante é
   **reportado**, não travado contra o valor narrativo 0.15 (que o TDD não exige).

## Consequências

- O headline científico do arco (25% de `m/m`) é determinístico e correto.
- A construção do pedigree é transparente e revisável; caso o design de produto
  fixe um `F` alvo para o Danecollie, ajusta-se o pedigree e cria-se novo ADR.

## Alternativas consideradas

- **Inventar fundadores para forçar F = 0.15**: rejeitada — seria alucinação de
  dados fora das tabelas; o TDD não pede esse valor.
