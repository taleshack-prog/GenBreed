# ADR-0001 — Loco de textura (curl) e a F1 do Goldendoodle

- **Status:** aceito
- **Data:** 2026-09-05

## Contexto

O TDD §4.5 (Goldendoodle) e o Gene-Bank §2 descrevem **duas texturas** de
pelagem na F1: ondulado (`F/f`, dominância incompleta) e cacheado (`F/F`,
dominante do Poodle). Ao mesmo tempo, descrevem os progenitores como Golden
Retriever **liso** (homozigoto reto) × Poodle **cacheado** (homozigoto crespo).

Isso é internamente inconsistente. Numa herança de loco único com dominância
incompleta (`F/F` cacheado, `F/f` ondulado, `f/f` liso):

```
Golden (f/f) × Poodle (F/F)  →  100% F/f (ondulado)
```

O genótipo `F/F` (cacheado) **não pode** surgir na F1; ele só reaparece na F2
(`F/f × F/f → ¼ F/F : ½ F/f : ¼ f/f`). Portanto a alegação de "cacheado na F1" é
biologicamente impossível.

## Decisão

1. Modelar o loco `F` (queratina/curl) com **dominância incompleta**:
   `F/F` = cacheado, `F/f` = ondulado, `f/f` = liso.
2. Fundadores: Golden `f/f`, Poodle `F/F`. A F1 é **100% ondulada** (`F/f`).
3. A variação **documentada** da F1 é **cromática**, não de textura: modelamos o
   loco `C` com `Golden = C/c^ch` (dourado, portador) × `Poodle = c^ch/c^ch`
   (creme), produzindo F1 `½ creme : ½ creme-parcial` — as duas variações do
   Gene-Bank ("Dourada" vs "Creme").
4. O golden test trava o resultado **correto** (100% ondulado; `F/F` ausente na
   F1) e a auditoria registra a alegação de "cacheado na F1" como **erro
   científico do Gene-Bank** (severidade maior).
5. `targetLoci` do IF na F1 = `["F"]` (traço de introgressão), heterozigoto →
   `H_alvo = 0`, produzindo IF baixo (Aura ★), coerente com "híbrido primário".

## Consequências

- Golden test cientificamente correto e determinístico.
- O jogo continua exibindo duas variações de F1 (por cor), preservando o valor
  narrativo/artístico do Gene-Bank sem violar a genética.
- Divergência explícita frente ao texto do Gene-Bank, documentada na auditoria.

## Alternativas consideradas

- **Tornar o Golden `F/f`** para gerar `F/F` na F1: rejeitada — contradiz o
  rótulo "liso" do progenitor e mascararia o erro em vez de expô-lo.
- **Aceitar o texto do Gene-Bank** (2 texturas na F1): rejeitada — viola Mendel;
  o papel de auditor exige recalcular e não homologar por precedência.
