# CLAUDE.md — GenBreedAI

Guia de contexto para o agente de código (Claude Code) neste repositório.

Leia este arquivo inteiro antes de qualquer tarefa. Ele define regras não negociáveis.

---

## 1. O que é este projeto

GenBreedAI: game de genética aplicada a animais (mobile PWA + web PC). O jogador cruza espécies, estuda herança mendeliana e quantitativa real e tenta fixar fenótipos desejados — ou falha. Imagens geradas por IA com pipeline híbrido (procedural + IA com cache determinístico).

## 2. Documentos de referência — FONTE ÚNICA DE VERDADE

| Arquivo | Papel | Quando ler |

|---|---|---|

| `docs/TDD-GenBreedAI.md` | Spec de engenharia executável: stack, modelo de dados, motor genético, golden tests, API, regras por tier, não-escopo | SEMPRE. Fonte canônica de implementação |

| `docs/PRD-GenBreedAI.md` | Requisitos de produto (narrativa para humanos/investidores) | Para entender o porquê das decisões de produto |

| `docs/specialists/especialista-genetica-aplicada.md` | Prompt de sistema do auditor científico | OBRIGATÓRIO no gate da Fase 0 (seção 6) |

REGRAS DE INTERPRETAÇÃO (herdadas do TDD, seção 0):

1. Não invente espécies, loci, alelos, valores de F, probabilidades ou regras fora das tabelas do TDD.

2. Anti-P2W: as probabilidades do motor são imutáveis por tier. Tiers alteram apenas ferramentas, pools de espécies e limites diários.

3. Determinismo: mesmo genótipo + mesmo método + mesmo seed = mesmo resultado (obrigatório para cache de IA e fairness).

4. Golden tests (TDD seção 4.5) devem passar 100% antes de qualquer nova feature.

5. Toda imagem gerada por IA passa por moderação antes de ser exibida ao usuário.

6. Não implemente nada listado em "Não-escopo" (TDD seção 9).

7. Ambiguidade: escolha a interpretação mais conservadora e registre em ADR em `docs/adr/`.

## 3. Estrutura do monorepo

```

genbreedai/

├── apps/

│   ├── web/       # Next.js (App Router) + Tailwind + next-pwa — PWA mobile + web PC

│   └── api/       # NestJS + Fastify — REST /api/v1

├── packages/

│   ├── engine/    # Motor genético em TypeScript puro, determinístico, sem I/O

│   └── shared/    # Tipos, DTOs, constantes compartilhadas

├── docs/

│   ├── PRD-GenBreedAI.md

│   ├── TDD-GenBreedAI.md

│   ├── specialists/

│   │   └── especialista-genetica-aplicada.md

│   ├── adr/       # Architecture Decision Records

│   └── audit/     # Pareceres de auditoria (ex.: fase0-audit.md)

├── CLAUDE.md

├── package.json   # Turborepo

└── pnpm-workspace.yaml

```

## 4. Stack e comandos

- Gerenciador: pnpm + Turborepo

- Frontend: Next.js 15 (App Router), TypeScript estrito, Tailwind CSS, next-pwa. Bundle < 35MB.

- Backend: NestJS (adapter Fastify), REST /api/v1, Drizzle ORM, PostgreSQL (genoma em JSONB), Redis + BullMQ, S3/R2 + CDN, Auth.js (NextAuth v5).

- Testes: Vitest (unit + golden), Playwright (E2E).

| Comando | O que faz |

|---|---|

| `pnpm install` | Instala dependências |

| `pnpm dev` | Sobe web + api em modo dev |

| `pnpm build` | Build de todos os pacotes |

| `pnpm test` | Roda todos os testes (unit + golden) |

| `pnpm test:golden` | Roda apenas os golden tests do motor |

| `pnpm lint` | Lint (ESLint) |

| `pnpm typecheck` | TypeScript estrito |

## 5. Convenções de código

- TypeScript estrito: proibido `any` sem ADR justificando.

- Motor genético (`packages/engine`): TypeScript puro, sem I/O, sem dependências externas; toda função pura e determinística sob seed.

- Golden tests em `packages/engine/src/__tests__/golden/` — um arquivo por arco (goldendoodle, boerpointer, danecollie, pumajaguar).

- Código e identificadores em inglês; comentários e docs em português.

- Commits convencionais: `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`.

- Nenhum merge sem `pnpm test:golden`, `pnpm typecheck` e `pnpm lint` verdes.

## 6. Gate da Fase 0 — OBRIGATÓRIO (não pule)

O motor genético (`packages/engine`) NÃO pode ser declarado concluído sem este fluxo:

1. Implemente o motor conforme TDD seção 4 (modelo de herança, matemática, IF, pseudocódigo).

2. Implemente os 4 golden tests (TDD seção 4.5) com tolerância zero sob seeds fixas.

3. Rode `pnpm test:golden` — 100% verdes obrigatório.

4. Assuma o papel definido em `docs/specialists/especialista-genetica-aplicada.md` e execute a auditoria completa:

   - Recalcule de forma independente os F de Wright e as probabilidades dos 4 arcos;

   - Verifique determinismo (mesma seed = mesmo resultado) e paridade anti-P2W (mesma entrada = mesmo resultado em qualquer tier);

   - Verifique a separação F_pedigree (biologia) vs. IF (gamificação).

5. Registre o parecer em `docs/audit/fase0-audit.md` com: matriz de achados (seção, problema, severidade, correção, nível de evidência GRADE), checklist dos golden tests e status final (APROVADO / REPROVADO).

6. Somente após APROVADO, inicie UI/API. Nenhuma feature de aplicação pode ser mergeada antes dos golden tests 100% verdes.

## 7. Definition of Done (todo PR)

- [ ] `pnpm test:golden` 100% verdes

- [ ] `pnpm typecheck` sem erros

- [ ] `pnpm lint` sem erros

- [ ] Anti-P2W: teste de paridade incluído sempre que o motor for tocado

- [ ] Moderação: imagens só são exibidas com ImageJob.status = APPROVED

- [ ] LGPD/COPPA: sem PII no chat, consentimento ativo

- [ ] Performance: bundle < 35MB; TTI < 3s em 4G médio

- [ ] ADR criado para qualquer decisão ambígua

## 8. ADR (Architecture Decision Record)

Formato mínimo em `docs/adr/000X-titulo.md`:

- Contexto (problema e restrições)

- Decisão (o que foi escolhido)

- Consequências (trade-offs, riscos)

- Alternativas consideradas (e por que foram rejeitadas)

## 9. Não-escopo (não implementar)

Web3/on-chain/NFTs, mercado fora do tier PhD, pecuária fora do PhD, websockets complexos (usar polling/SSE), nativo Swift/Kotlin, checkout multi-moeda. Detalhes no TDD seção 9.