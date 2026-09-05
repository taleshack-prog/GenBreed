# Parecer de Auditoria Científica — Fase 0 (Motor Genético)

**Projeto:** GenBreedAI · Hack Tech Farm
**Artefato auditado:** `packages/engine` (motor genético headless) + golden tests
**Papel:** Geneticista de populações / melhorista animal / auditor de software científico
(`docs/specialists/especialista-genetica-aplicada.md`)
**Data:** 2026-09-05 · **Versão do motor:** 0.1.0

> Metodologia: recálculo **independente** de todos os F de Wright e probabilidades
> (Mendel, Punnett, Wright 1922, Falconer & Mackay 1996, Haldane 1922), sem
> validar valores por precedência. Nível de evidência por achado em escala GRADE
> (alta / moderada / baixa / muito baixa).

---

## 1. Escopo e método

Auditou-se: (a) a matemática do motor; (b) a suíte de golden tests dos 4 arcos;
(c) determinismo e paridade anti-P2W; (d) a separação `F_pedigree` × `IF`.
Cada valor documentado no TDD §4.5 e no Gene-Bank foi **recalculado do zero** e
confrontado com a saída do motor.

## 2. Matriz de achados

| # | Seção | Problema | Severidade | Correção | GRADE |
|---|---|---|---|---|---|
| A1 | Gene-Bank §3.7 / §5.11 | `F` narrativo (F2=0.10, BC1=0.03) diverge do F de Wright real (0.25). | **Maior** | Motor calcula Wright real; golden tests travam 0.25 (TDD §4.5). Errata editorial no Gene-Bank. Ver ADR-0002. | Alta |
| A2 | TDD §4.5 (Pumajaguar) | `IF ≈ 0.03` é impossível dado `F_pedigree=0.25` (G_pedigree=1.0 ⇒ IF≥0.30). | **Crítica** | IF calculado pela fórmula (≥0.30). "0.03" marcado para errata no TDD. Ver ADR-0004. | Alta |
| A3 | Gene-Bank §2 (Goldendoodle) | "Cacheado `F/F`" na F1 é biologicamente impossível (f/f×F/F ⇒ 100% F/f). | **Maior** | F1 travada em 100% ondulado; variação da F1 modelada como cromática. Ver ADR-0001. | Alta |
| A4 | Gene-Bank §4 (Danecollie) | `F: 0.15` narrativo sem genótipos de fundadores; TDD não exige F. | **Menor** | Trava-se o requisito real (P(m/m)=0.25); F reportado, não fixado. Ver ADR-0003. | Moderada |
| A5 | TDD §4.5 (Danecollie) | "Tau e Phi" citados como recombinantes do arco F3, mas são indivíduos F2. | **Menor** | Modelados como **classes** recombinantes com probabilidade conjunta exata (Tau=0.125, Phi=0.0625). | Moderada |
| A6 | TDD §4.1 (Merle) | `M/M` (duplo-merle) letal precisa ser explicitado na expressão. | **Menor** | Implementado como `LethalCombo`; expressão retorna `viable=false`. | Alta |

Nenhum achado bloqueia a Fase 0: todos foram resolvidos no motor com registro em
ADR; os achados A1–A3 exigem **errata editorial** nos documentos-fonte (não no
código).

## 3. Recálculo independente por arco

### 3.1 Goldendoodle F1 (Golden × Poodle)
- `F_pedigree = f(golden, poodle) = 0` (fundadores não aparentados). **✔ confere.**
- Textura (loco F, dominância incompleta): `f/f × F/F → 100% F/f` (ondulado).
  O `F/F` cacheado **não** existe na F1. **✔ motor confere; Gene-Bank incorreto (A3).**
- Cor (loco C): `C/c^ch × c^ch/c^ch → ½ creme : ½ creme-parcial`. **✔ confere.**
- IF (alvo = loco F, heterozigoto): H=0, G=0, S=1/7 ⇒ IF≈0.029 ⇒ **Aura ★.** **✔.**

### 3.2 Boerpointer F2 (Alpha × Beta, irmãos completos)
- `F_pedigree = f(alpha, beta) = 0.25`. **✔ confere (TDD §4.5).**
- Loco B: `B/b × B/b → ¾ dominante : ¼ recessivo` (3:1). **✔ confere.**
- `P(b/b) = P(k^y/k^y) = P(a/a) = 0.25`; piebald `s^p/s^p = 0.25`. **✔ confere.**
- Fertilidade F2 (base 30–50) sob depressão (F=0.25 ⇒ −20%). **✔ coerente.**

### 3.3 Danecollie F3 (Omega II × Beta)
- Loco M: `M/m × M/m → ¼ M/M(letal) : ½ M/m : ¼ m/m`. `P(m/m)=0.25`. **✔ confere (TDD §4.5).**
- Epistasia Harlequin: `H_ + M_ → arlequim` (fundo branco). **✔ implementado.**
- Recombinantes: `Tau {H/h,M/m,a/a}=0.125`; `Phi {M/m,a/a,s^p/s^p}=0.0625`. **✔.**

### 3.4 Pumajaguar BC1 (Delta × Onça Negra)
- `F_pedigree = f(delta, negra) = 0.25` (retrocruzamento ao progenitor). **✔ confere (TDD §4.5).**
- Loco A (melanismo dominante): `Aa × Aa → ¼ AA : ½ Aa : ¼ aa`.
  `P(melanístico A_) = 0.75`; `P(AA fixado) = 0.25`. **✔ fixação do melanismo confere.**
- IF: `G_pedigree=1.0` ⇒ IF≥0.30 (obs. ≈0.357 p/ prole Aa). **✔ motor; "IF≈0.03" impossível (A2).**
- Fertilidade BC1 (60–80) sob depressão (F=0.25 ⇒ −20%) ⇒ [48,64]; inviabilidade=0
  (F não é >0.25); Haldane não se aplica a BC1. **✔ coerente com TDD §4.2.**

## 4. Determinismo e Anti-P2W

- **Determinismo:** para toda seed fixa, `cross()` reproduz genótipo, fenótipo,
  `F_pedigree`, IF, aura e `cacheKey` idênticos em execuções repetidas. **✔.**
- **Anti-P2W:** `cross()` **não possui** parâmetro de tier (assinatura de 5
  parâmetros). O resultado depende só de (genótipo + método + seed). Teste de
  paridade confirma saída idêntica ao simular os 4 tiers. **✔.**
- **Separação `F_pedigree` × IF:** `F_pedigree` (Wright, biologia) alimenta
  alertas de depressão/esterilidade; IF (composto, jogo) alimenta rank/aura.
  São calculados por funções distintas (`wright.ts` × `fixation.ts`). **✔.**

## 5. Checklist dos Golden Tests (tolerância zero sob seeds fixas)

| Caso | Requisito TDD §4.5 | Resultado do motor | Status |
|---|---|---|---|
| Goldendoodle F1 | F_ped=0.00; textura; Aura ★ | F_ped=0; 100% ondulado; cor 1:1; Aura ★ | ✅ |
| Boerpointer F2 | F_ped=0.25; 3:1; recessivos 25% | F_ped=0.25; 3:1; b/b=k^y/k^y=a/a=0.25 | ✅ |
| Danecollie F3 | m/m=25%; Tau/Phi; letal M/M | P(m/m)=0.25; Tau=0.125; Phi=0.0625; M/M inviável | ✅ |
| Pumajaguar BC1 | F_ped=0.25; melanismo; IF | F_ped=0.25; A_=0.75, AA=0.25; IF≥0.30 (corrige A2) | ✅ |
| Paridade Anti-P2W | idêntico por tier | idêntico nos 4 tiers | ✅ |

**Execução:** `pnpm test:golden` → **22/22 verdes**. Suíte completa → **44/44
verdes**. `typecheck` (strict, `noUncheckedIndexedAccess`) → **0 erros**.

## 6. Calibração (mutação e auras)

- Mutação µ=1e-4/loco/gameta (TDD §4.2): não dispara sob as seeds dos golden
  tests (esperado; probabilidade desprezível). Alelo mutante recebe rótulo
  indelével "mutação". **✔.**
- Auras: limiares do TDD §4.3 implementados e testados (1★<0.25 … 5★≥0.90). **✔.**

## 7. Limitações e lacunas reconhecidas

- QTLs usam modelo aditivo midparent determinístico; a **Equação do Criador**
  (R=h²·S) está implementada como primitiva (`fStatistic`, herdabilidades no
  pack) mas a resposta à seleção multigeracional não é exercida pelos 4 arcos
  discretos — recomenda-se um 5º arco quantitativo em playtest (pré-registro).
- Pedigrees dos arcos 3 e 4 são construções mínimas suficientes para os
  requisitos; linhagens completas de 7 gerações entram na Fase 1 (visualização).

## 8. Parecer final

> **STATUS: APROVADO** — condicionado a **errata editorial** dos documentos-fonte
> (achados A1, A2, A3) registrada nos ADRs 0001–0004. O código do motor está
> cientificamente correto, determinístico, anti-P2W e com golden tests 100%
> verdes. Nenhum achado de severidade crítica/maior permanece **no código**; os
> críticos/maiores remanescentes são **textuais** (TDD/Gene-Bank) e não bloqueiam
> a Fase 0.

**Recomendação:** liberar o início da **Fase 1 (UI/API)** conforme TDD §9,
mantendo os golden tests como gate de merge, e abrir tarefas de errata para
TDD §4.5 (Pumajaguar IF) e Gene-Bank §2/§3/§5 (F narrativo e F1 do Goldendoodle).

---
*Auditoria conduzida sob os princípios do prompt do especialista: rigor
científico absoluto, neutralidade radical, transparência metodológica e
recálculo independente. Assinado: Auditor Científico GenBreedAI (papel de sistema).*
