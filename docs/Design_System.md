## 1. Contexto e objetivo do documento

O GenBreed é um jogo mobile de genética aplicada (canídeos e felinos) com estética Cyber-Genetics: UI sci-fi industrial escura, neon ciano/púrpura, animais fotorrealistas em estúdio e dados genéticos (GEN, F, estrelas) como linguagem visual central.

Este documento existe para eliminar alucinação do Claude no desenvolvimento: todo valor visual, nome de componente, prop, estado e cor está especificado com hex exato. O Claude não decide nada — ele implementa o que está aqui.

## 2. Design System (tokens)

### 2.1 Paleta de cores (hex exatos)

- Fundo primário: #050A0F (quase preto azulado) 

- Fundo secundário (painéis): #0B1420 

- Neon ciano (progenitor A / inventário): #00F0FF 

- Neon púrpura (progenitor B / laboratório): #BF00FF 

- Branco primário (títulos): #FFFFFF 

- Cinza texto secundário: #9E9E9E 

- Verde status (concluído): #00FF9D 

- Amarelo alerta (depressão endogâmica): #FFC107 

- Vermelho crítico (F > 0.20): #FF3B5C 

- Líquido criogênico (cápsulas): gradiente #00F0FF → #0A84FF com opacidade 0.35 

### 2.2 Tipografia

- Display (títulos de tela e nomes de raças): Orbitron ou Exo 2 — Bold, caixa alta, letter-spacing 0.08em 

- Corpo (descrições): Inter ou Montserrat — Regular 400 / Medium 500 

- Dados técnicos (GEN, F, IDs): JetBrains Mono — monospace, para reforçar a estética de laboratório 

### 2.3 Efeitos e componentes

- Borda neon: box-shadow: 0 0 12px rgba(0, 240, 255, 0.6), inset 0 0 8px rgba(0, 240, 255, 0.2) (ciano) e equivalente com rgba(191, 0, 255, ...) (púrpura) 

- Cápsula criogênica: cilindro com vidro (backdrop-blur), líquido animado (pulso de opacidade), partículas de DNA flutuantes 

- Hélice de DNA: SVG com gradiente ciano→púrpura, animação de rotação lenta (CSS @keyframes) 

- Cards: raio 16px, fundo #0B1420, borda 1px com opacidade 0.3 na cor do slot 

## 3. Direção de arte dos animais

### 3.1 Padrão fotográfico obrigatório

- Estilo: fotorrealismo extremo, retrato de estúdio, iluminação frontal neutra, fundo escuro uniforme (#0A0E14), foco nítido no animal 

- Enquadramento: cabeça e ombros centralizados, olhar levemente acima da linha da câmera 

- Formato de asset: PNG 1024×1024 (mínimo), fundo removido ou uniforme para não quebrar a imersão do estúdio 

- Proibido: ilustração, cartoon, low-poly, fundo com cenário — o realismo é o diferencial do jogo 

### 3.2 Precisão anatômica por família

- Canídeos (CANÍDEO): pelagem anatomicamente correta por raça — Boerboel (robusto, focinho curto, fulvo/brindle), Braço Alemão (esguio, liver/roan), Dogue Arlequim (base branca + manchas pretas irregulares), Collie (tan points + colar branco) 

- Felinos (FELINO): onça parda (fulvo sólido, elegante), onça negra (melanismo com rosetas fantasma visíveis sob luz) 

- Híbridos F1/F2/F3: combinar traços dos progenitores com dominância alélica — nunca inventar padrões fora dos loci documentados no Gene Bank 

### 3.3 Nomenclatura de assets

## Código

/assets/animals/{familia}/{raca}/{fenotipo}.png

Ex: /assets/animals/canideo/boerpointer/alpha.png

    /assets/animals/felino/pumajaguar/delta.png

## 4. Schema de dados (TypeScript — base do TDD)

## Código

// src/types/genetics.ts

export type Familia = 'CANIDEO' | 'FELINO';

export type StatusCruzamento = 'pendente' | 'processando' | 'concluido';

export type EstrategiaCruzamento =

  | 'F1'          // inter-raças puras

  | 'F2'          // F1 × F1 (irmãos)

  | 'F3'          // recombinação adicional

  | 'BACKCROSS'   // híbrido × parental recorrente

  | 'LINEBREEDING'

  | 'INBREEDING'

  | 'OUTCROSS';   // resgate por heterose

export interface Raca {

  id: string;

  nome: string;                 // 'BOERBOEL'

  familia: Familia;

  corSlot: 'ciano' | 'purpura'; // cor do painel neon

  assetPath: string;

  loci: Locus[];                // loci genéticos da raça

}

export interface Animal {

  id: string;

  nome: string;                 // 'BOERPOINTER ALPHA'

  racaBase: string;             // 'BOERBOEL x BRACO ALEMAO'

  familia: Familia;

  geracao: number;              // GEN 1, 2, 3...

  indiceF: number;              // F: 0.05 (0.00 – 0.30)

  raridade: 1 | 2 | 3 | 4 | 5;  // estrelas

  fenotipo: string;             // 'liver/roan atletico'

  genotipo: string;             // 'B/b, K^br/k^y'

  assetPath: string;

  statusVigor: 'saudavel' | 'alerta' | 'critico'; // regra: F > 0.20 = critico

}

export interface Locus {

  simbolo: string;              // 'K', 'A', 'B', 'M', 'H', 'S'

  alelos: string[];             // ['K^br', 'k^y']

  dominancia: Record<string, string>; // alelo -> fenotipo

}

export interface Cruzamento {

  id: string;

  progenitorA: Animal;

  progenitorB: Animal;

  estrategia: EstrategiaCruzamento;

  data: Date;

  status: StatusCruzamento;

  resultado: Animal[];          // 1-6 fenótipos possíveis

}

export interface GeneBankEntry {

  animalId: string;

  criogeniaAtiva: boolean;

  aptoRetrobreeding: boolean;   // true quando F <= 0.10

  dataCriogenia: Date;

}

Regras de negócio que o TDD deve cobrir (derivadas do Gene Bank):

- indiceF de F1 puro = 0.05; F2 (irmãos) ≈ 0.10; inbreeding de irmãos ≈ 0.15; inbreeding acumulado ≈ 0.25 

- Backcross derruba F para ≈ 0.03; outcross reduz 40–60% do F atual 

- statusVigor = 'critico' quando indiceF > 0.20 (alerta de depressão endogâmica) 

- aptoRetrobreeding = true quando indiceF <= 0.10

## 5. Especificação das telas

### 5.1 Tela de Cruzamento (imagem 1 — slots neon)

- Layout: tela cheia, fundo #050A0F, título "CRUZAR ESPÉCIES" em Orbitron 

- Slot A (esquerda): card retangular, borda neon ciano, retrato realista do progenitor A, nome da raça em branco bold, subtítulo "CANÍDEO" em ciano 

- Slot B (direita): mesmo layout com borda púrpura e subtítulo em púrpura 

- Centro: círculo com "+" fundindo as cores + hélice de DNA vertical (gradiente ciano→púrpura) 

- CTA inferior: botão "CRUZAR ESPÉCIES" com brilho neon, desabilitado até os 2 slots preenchidos 

- Estados: vazio (slot com placeholder "SELECIONE"), selecionado (animal preenchido), processando (spinner + DNA animado), concluído (navega para resultado) 

### 5.2 Banco Genético (imagem 2 — cápsulas)

- Layout: grid 2 colunas × 3 linhas de cápsulas criogênicas 

- Cada cápsula: cilindro de vidro com líquido azul animado, animal fotorrealista flutuando, partículas de DNA 

- Metadados: nome do animal (topo, Orbitron bold), linha técnica com GEN {n} e F: {valor} (JetBrains Mono), 5 estrelas de raridade na base (preenchidas conforme raridade) 

- Estados: ativa (brilho ciano), selecionada (anel púrpura), alerta (borda amarela quando F > 0.15), crítica (borda vermelha quando F > 0.20) 

### 5.3 Bottom Navigation (fixa em todas as telas)

Ícones line-style, ativo com glow ciano, inativo em #9E9E9E.

## 6. Componentes React/Tailwind (contrato para o Claude)

| Componente | Props obrigatórias | Estado interno |
| --- | --- | --- |
| SlotAnimal | animal: Animal │ null, corSlot: 'ciano' │ 'purpura' | selecionado |
| DnaHelix | corA: string, corB: string, animando: boolean | — |
| BotaoCruzar | habilitado: boolean, onClick | carregando |
| CapsulaCriogenica | animal: Animal, selecionada: boolean | alerta (deriva de F) |
| GridBancoGenetico | animais: Animal[] | filtro por família |
| BarraRaridade | valor: 1│2│3│4│5 | — |
| BottomNav | abaAtiva: string | — |