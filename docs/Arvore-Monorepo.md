genbreedai/

├── apps/

│   ├── web/                      # Next.js (App Router) — PWA mobile + web PC

│   │   ├── app/

│   │   │   ├── layout.tsx

│   │   │   └── page.tsx

│   │   ├── next.config.mts

│   │   └── package.json

│   └── api/                      # NestJS + Fastify — REST 

## Árvore final do monorepo

## Código

genbreedai/

├── package.json                  # Turborepo (raiz)

├── pnpm-workspace.yaml

├── turbo.json

├── tsconfig.base.json

├── .gitignore

├── CLAUDE.md

├── docs/

│   ├── PRD-GenBreedAI.md

│   ├── TDD-GenBreedAI.md

│   ├── specialists/

│   │   └── especialista-genetica-aplicada.md

│   └── adr/

│       └── 0000-template.md      # template de ADR

├── apps/

│   ├── web/

│   │   ├── package.json

│   │   ├── tsconfig.json

│   │   ├── next.config.mts

│   │   └── app/

│   │       ├── layout.tsx

│   │       └── page.tsx

│   └── api/

│       ├── package.json

│       ├── tsconfig.json

│       └── src/

│           └── main.ts

└── packages/

    ├── engine/

    │   ├── package.json

    │   ├── tsconfig.json

    │   ├── vitest.config.ts

    │   ├── vitest.golden.config.ts

    │   └── src/

    │       ├── index.ts

    │       └── __tests__/

    │           └── golden/

    │               ├── goldendoodle.test.ts

    │               ├── boerpointer.test.ts

    │               ├── danecollie.test.ts

    │               └── pumajaguar.test.ts

    └── shared/

        ├── package.json

        ├── tsconfig.json

        └── src/

            └── index.ts

## Arquivos raiz

package.json (raiz — Turborepo):

## Código

{

  "name": "genbreedai",

  "version": "0.0.0",

  "private": true,

  "packageManager": "pnpm@9.15.0",

  "engines": {

    "node": ">=20"

  },

  "scripts": {

    "dev": "turbo run dev",

    "build": "turbo run build",

    "test": "turbo run test",

    "test:golden": "turbo run test:golden",

    "lint": "turbo run lint",

    "typecheck": "turbo run typecheck"

  },

  "devDependencies": {

    "turbo": "^2.3.0",

    "typescript": "^5.7.0"

  }

}

pnpm-workspace.yaml:

## Código

packages:

  - "apps/*"

- "packages/*"

turbo.json:

## Código

{

  "$schema": "https://turbo.build/schema.json",

  "tasks": {

    "build": {

      "dependsOn": ["^build"],

      "outputs": ["dist/**", ".next/**"]

    },

    "dev": {

      "cache": false,

      "persistent": true

    },

    "test": {

      "dependsOn": ["^build"],

      "outputs": []

    },

    "test:golden": {

      "dependsOn": ["^build"],

      "outputs": []

    },

    "lint": {

      "outputs": []

    },

    "typecheck": {

      "dependsOn": ["^build"],

      "outputs": []

    }

  }

}

tsconfig.base.json:

## Código

{

  "compilerOptions": {

    "target": "ES2022",

    "lib": ["ES2022"],

    "module": "ESNext",

    "moduleResolution": "Bundler",

    "strict": true,

    "noImplicitAny": true,

    "noUncheckedIndexedAccess": true,

    "noFallthroughCasesInSwitch": true,

    "esModuleInterop": true,

    "skipLibCheck": true,

    "forceConsistentCasingInFileNames": true,

    "resolveJsonModule": true,

    "isolatedModules": true,

    "declaration": true,

    "declarationMap": true,

    "sourceMap": true

  }

}

.gitignore:

## Código

node_modules/

dist/

.next/

.turbo/

coverage/

*.tsbuildinfo

.env

.env.local

.env.*.local

.DS_Store

## 

## Pacotes do motor e shared

packages/engine/package.json:

## Código

{

  "name": "@genbreedai/engine",

  "version": "0.0.0",

  "private": true,

  "type": "module",

  "main": "./dist/index.js",

  "types": "./dist/index.d.ts",

  "exports": {

    ".": {

      "types": "./dist/index.d.ts",

      "import": "./dist/index.js"

    }

  },

  "scripts": {

    "build": "tsc -p tsconfig.json",

    "dev": "tsc -p tsconfig.json --watch",

    "test": "vitest run",

    "test:golden": "vitest run --config vitest.golden.config.ts",

    "lint": "eslint .",

    "typecheck": "tsc --noEmit"

  },

  "devDependencies": {

    "typescript": "^5.7.0",

    "vitest": "^2.1.0"

  }

}

packages/engine/tsconfig.json:

## Código

{

  "extends": "../../tsconfig.base.json",

  "compilerOptions": {

    "outDir": "./dist",

    "rootDir": "./src"

  },

  "include": ["src/**/*"],

  "exclude": ["node_modules", "dist"]

}

packages/engine/vitest.config.ts:

## Código

import { defineConfig } from "vitest/config";

export default defineConfig({

  test: {

    include: ["src/**/*.test.ts"],

    environment: "node",

  },

});

packages/engine/vitest.golden.config.ts:

## Código

import { defineConfig } from "vitest/config";

export default defineConfig({

  test: {

    include: ["src/__tests__/golden/**/*.test.ts"],

    environment: "node",

    // Tolerância zero: seeds fixas e valores exatos (TDD seção 4.5)

  },

});

packages/engine/src/index.ts (placeholder):

## Código

// Motor genético determinístico — TDD seção 4.

// Implementar: cross(), wrightF(), fertilityScore(), fixationIndex().

Export {};

packages/shared/package.json:

## Código

{

  "name": "@genbreedai/shared",

  "version": "0.0.0",

  "private": true,

  "type": "module",

  "main": "./dist/index.js",

  "types": "./dist/index.d.ts",

  "exports": {

    ".": {

      "types": "./dist/index.d.ts",

      "import": "./dist/index.js"

    }

  },

  "scripts": {

    "build": "tsc -p tsconfig.json",

    "dev": "tsc -p tsconfig.json --watch",

    "lint": "eslint .",

    "typecheck": "tsc --noEmit"

  },

  "devDependencies": {

    "typescript": "^5.7.0"

  }

}

packages/shared/tsconfig.json:

## Código

{

  "extends": "../../tsconfig.base.json",

  "compilerOptions": {

    "outDir": "./dist",

    "rootDir": "./src"

  },

  "include": ["src/**/*"],

  "exclude": ["node_modules", "dist"]

}

## Apps

apps/web/package.json:

## Código

{

  "name": "@genbreedai/web",

  "version": "0.0.0",

  "private": true,

  "scripts": {

    "dev": "next dev",

    "build": "next build",

    "start": "next start",

    "lint": "eslint .",

    "typecheck": "tsc --noEmit"

  },

  "dependencies": {

    "@ducanh2912/next-pwa": "^10.0.0",

    "@genbreedai/engine": "workspace:*",

    "@genbreedai/shared": "workspace:*",

    "next": "^15.1.0",

    "react": "^19.0.0",

    "react-dom": "^19.0.0"

  },

  "devDependencies": {

    "@types/node": "^20.0.0",

    "@types/react": "^19.0.0",

    "@types/react-dom": "^19.0.0",

    "autoprefixer": "^10.4.0",

    "postcss": "^8.4.0",

    "tailwindcss": "^3.4.0",

    "typescript": "^5.7.0"

  }

}

apps/web/tsconfig.json:

## Código

{

  "extends": "../../tsconfig.base.json",

  "compilerOptions": {

    "target": "ES2022",

    "lib": ["dom", "dom.iterable", "esnext"],

    "module": "esnext",

    "moduleResolution": "bundler",

    "jsx": "preserve",

    "noEmit": true,

    "allowJs": true,

    "incremental": true,

    "plugins": [{ "name": "next" }],

    "paths": {

      "@genbreedai/engine": ["../../packages/engine/src"],

      "@genbreedai/shared": ["../../packages/shared/src"]

    }

  },

  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],

  "exclude": ["node_modules"]

}

apps/web/next.config.mts:

## Código

import withPWA from "@ducanh2912/next-pwa";

const nextConfig = withPWA({

  dest: "public",

  register: true,

  skipWaiting: true,

  disable: process.env.NODE_ENV === "development",

});

export default nextConfig;

apps/api/package.json:

## Código

{

  "name": "@genbreedai/api",

  "version": "0.0.0",

  "private": true,

  "scripts": {

    "dev": "nest start --watch",

    "build": "nest build",

    "start": "node dist/main.js",

    "lint": "eslint .",

    "typecheck": "tsc --noEmit",

    "test": "vitest run"

  },

  "dependencies": {

    "@genbreedai/engine": "workspace:*",

    "@genbreedai/shared": "workspace:*",

    "@nestjs/common": "^10.4.0",

    "@nestjs/core": "^10.4.0",

    "@nestjs/platform-fastify": "^10.4.0",

    "bullmq": "^5.0.0",

    "drizzle-orm": "^0.36.0",

    "ioredis": "^5.4.0",

    "postgres": "^3.4.0",

    "reflect-metadata": "^0.2.0",

    "rxjs": "^7.8.0"

  },

  "devDependencies": {

    "@nestjs/cli": "^10.4.0",

    "@types/node": "^20.0.0",

    "typescript": "^5.7.0",

    "vitest": "^2.1.0"

  }

}

apps/api/tsconfig.json:

## Código

{

  "extends": "../../tsconfig.base.json",

  "compilerOptions": {

    "module": "commonjs",

    "moduleResolution": "node",

    "emitDecoratorMetadata": true,

    "experimentalDecorators": true,

    "outDir": "./dist",

    "baseUrl": "./",

    "paths": {

      "@genbreedai/engine": ["../../packages/engine/src"],

      "@genbreedai/shared": ["../../packages/shared/src"]

    }

  },

  "include": ["src/**/*"],

  "exclude": ["node_modules", "dist"]

}

## Template de ADR

docs/adr/0000-template.md:

Markdown

# ADR-0000: [Título da decisão]

- Status: Proposto | Aceito | Depreciado | Substituído por ADR-XXXX

- Data: AAAA-MM-DD

- Decisores: [nomes]

- Fase: Fase 0 | Fase 1 | Fase 2 | Fase 3 | Fase 4

## Contexto

[Problema, restrições e motivação. Por que essa decisão existe?

Cite a seção do TDD ou do Gene-Bank que a motiva, se houver.]

## Decisão

[O que foi escolhido, de forma concreta e verificável.

Registre também a interpretação adotada quando o TDD deixar ambiguidade.]

## Consequências

[Trade-offs, riscos e custos. O que essa decisão facilita e o que dificulta?

Impacto em determinismo, anti-P2W, cache de IA ou moderação, se aplicável.]

## Alternativas consideradas

- [Alternativa A] — [por que foi rejeitada]

- [Alternativa B] — [por que foi rejeitada]

## Referências

- [TDD seção X | Gene-Bank | PRD seção Y | outro ADR]