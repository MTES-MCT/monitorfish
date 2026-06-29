# ADR-0010: Migration du linter frontend d'ESLint vers OxLint, lint type-aware séparé et refonte des hooks Git / lint CI

**Date:** 2026-06-29
**Statut:** Accepté

## Contexte

Le lint du frontend tournait sur **ESLint 8 + Airbnb** avec une passe *type-aware* : lent et
gourmand en mémoire (le script `test:lint` exigeait `--max-old-space-size=8192`, ~75 s et ~8 Go).
Cette lenteur pénalisait à la fois le poste de développement (hook de pré-commit) et la CI.

En parallèle, plusieurs faiblesses de l'outillage qualité ont été identifiées :

- Le hook de pré-commit formatait **tout** le backend (`gradlew ktlintFormat`) à chaque commit,
  même pour un commit purement frontend, sans **réindexer** les fichiers formatés : la correction
  arrivait donc *après* le commit (working tree non *staged*), et le `| grep` masquait le code de
  sortie de Gradle.
- Le lint Kotlin du backend n'était **jamais** appliqué de façon bloquante : aucune étape
  `ktlintCheck` en CI et `ktlint { ignoreFailures = true }`.
- La vérification de types (`tsc`, ~40 s) s'exécutait dans le pré-commit pour chaque commit
  touchant un `.ts`/`.tsx`, ralentissant inutilement les commits.

## Décision

1. **Migrer le linter frontend vers OxLint** (Rust, ~25× plus rapide), en exécutant les plugins
   ESLint sans équivalent natif **dans OxLint via `jsPlugins`**. Conserver **Prettier** comme
   formateur autonome.
2. **Sortir le lint *type-aware* d'OxLint** : il n'est pas viable ici (cf. *Alternatives*). Il est
   assuré par une **passe `typescript-eslint` dédiée** (`eslint-typed.config.cjs`,
   `npm run test:lint:types`) utilisant le vrai compilateur TypeScript, exécutée en CI et au
   `pre-push`.
3. **Rendre les hooks Git « état de l'art »** : pré-commit rapide (lint des fichiers *staged*
   uniquement), checks lents (type-check, lint type-aware) déplacés au `pre-push`, et formatage
   backend réindexé dans le commit.
4. **Faire appliquer le lint Kotlin du backend en CI** (`ktlintCheck` bloquant).

## Implémentation

### 1. OxLint + jsPlugins (`frontend/.oxlintrc.json`)

- Plugins natifs OxLint : `import`, `react`, `typescript`, `jsx-a11y`, `unicorn`, `oxc`.
- `jsPlugins` (plugins ESLint exécutés en in-process par OxLint, API compatible ESLint) :
  `eslint-plugin-sort-keys-fix`, `eslint-plugin-sort-destructure-keys`,
  `eslint-plugin-typescript-sort-keys`, `eslint-plugin-import` (alias `import-js`),
  `eslint-plugin-react` (alias `react-js`), `@stylistic/eslint-plugin` (alias `stylistic`).
  Les alias `-js` contournent les noms réservés `import`/`react`.
- Catégories : `correctness: error` + `perf: warn`. Règle `react-hooks/rules-of-hooks` épinglée
  en `error`.
- Règles syntaxiques (sans information de type) ajoutées : `typescript-sort-keys/interface`,
  `@stylistic/lines-between-class-members`.
- Prettier reste autonome, accéléré par `@prettier/plugin-oxc`.

| Configuration | Temps | Mémoire |
|---|---|---|
| Avant — ESLint Airbnb + type-aware | ~75 s | ~8 Go |
| OxLint + jsPlugins | ~3 s | ~0,3 Go |

### 2. Passe type-aware séparée (`frontend/eslint-typed.config.cjs` + `test:lint:types`)

- Format `.eslintrc` (ESLint 8.57), lancée avec `--no-eslintrc --no-inline-config` (cette dernière
  option évite les erreurs « rule definition not found » dues aux anciens commentaires
  `eslint-disable` référençant des plugins absents de cette config).
- `tsconfig.json` **inchangé** : le vrai compilateur TypeScript supporte `baseUrl`.
- Règles en `warn` (backlog à résorber, puis promotion en `error` au fil de l'eau) :
  `no-floating-promises`, `no-misused-promises`, `await-thenable`, `require-await`,
  `no-unnecessary-type-assertion`, `prefer-nullish-coalescing`.
- Script `test:lint:types:fix` pour appliquer les corrections auto-fixables.
- ⚠️ `prefer-nullish-coalescing` est *suggestion-only* : `eslint --fix` ne convertit **pas**
  automatiquement `||` en `??` (changement sémantique). Seules les corrections sûres
  (ex. `no-unnecessary-type-assertion`) sont appliquées.

### 3. Hooks Git (`frontend/config/husky/`, Husky 9)

- **`pre-commit`** : `lint-staged` pour le frontend (OxLint `--fix` + Prettier) **et** pour le
  backend (formatage Kotlin des fichiers *staged*), tous deux réindexés automatiquement.
  Volontairement minimal pour garder des commits **rapides (< 20 s)** : le `tsc` complet a été
  **retiré**.
  - Backend : on n'utilise **pas** `gradlew ktlintFormat` (JVM lente, formate tout le backend).
    On invoque le **CLI ktlint autonome** (`backend/tools/ktlint`, version épinglée 1.5.0,
    téléchargée et mise en cache au premier usage) uniquement sur les fichiers *staged*, via une
    config `backend/.lintstagedrc.json` :
    `tools/ktlint -F --relative --baseline=config/ktlint/baseline.xml`. `lint-staged` gère la
    réindexation et le *stash* des modifications non *staged* (cas `git add -p`). La seconde
    invocation `lint-staged --cwd ./backend` n'est lancée que si des `*.kt`/`*.kts` sont *staged*.
- **`pre-push`** (nouveau) : checks lents non *scopables* aux fichiers *staged* → `npm run test:type`
  (tsc complet) et `npm run test:lint:types`.
- **Backend (CI)** : le lint Kotlin reste garanti par `ktlintCheck` en CI (cf. §4) ; le formatage
  complet manuel reste disponible via `make lint-back`.

### 4. Application du lint Kotlin en CI

- `backend/build.gradle.kts` : `ignoreFailures` passé de `true` à `false`, et **baseline ktlint**
  (`config/ktlint/baseline.xml`) enregistrant les violations existantes acceptées
  (809 violations sur 485 fichiers : `no-wildcard-imports`, `package-name`, `max-line-length`, etc.).
  `ktlintCheck` n'échoue donc que sur les **nouvelles** violations, sans reformater l'existant.
- `.github/workflows/cicd.yml` : étape **Lint Backend** (`./gradlew ktlintCheck`) ajoutée au job
  backend, plus une étape **Type-aware lint Frontend** (`npm run test:lint:types`) côté frontend.

> La baseline a été préférée à la désactivation des règles dans `.editorconfig` : désactiver
> `max-line-length` pousse `ktlintFormat` à « dé-wrapper » les longues lignes (reformatage massif et
> non souhaité de l'existant).

### 5. Corrections de code induites

- Tri des membres d'interface (`typescript-sort-keys/interface`) appliqué.
- Règles `perf` auto-fixables appliquées (`prefer-set-has`, `prefer-array-flat-map`).
- `no-accumulating-spread` / `no-map-spread` corrigées manuellement là où c'est sûr (réduction par
  mutation de l'accumulateur, `.filter()`/`.flatMap()`), notamment le passage à
  `vesselsAdapter.updateMany` dans `removeVesselReportings` (évite de *spread* toute la collection
  de navires).
- Suppression des assertions de type inutiles (`no-unnecessary-type-assertion`).

## Avantages

- ✅ Lint ~25× plus rapide, mémoire divisée par ~25.
- ✅ Commits rapides (plus de `tsc` au pré-commit), feedback type-aware au push et en CI.
- ✅ Le formatage backend fait désormais partie du commit (et plus *après*).
- ✅ Lint Kotlin réellement bloquant en CI.

## Inconvénients / Réserves

- ⚠️ `jsPlugins` est une fonctionnalité encore récente d'OxLint.
- ⚠️ Backlog `test:lint:types` (~850) à résorber avant de promouvoir ses règles en `error`.
- ⚠️ Pré-commit backend : `ktlintFormat` formate tout le backend (ktlint-gradle ne cible pas un
  sous-ensemble de fichiers) ; seuls les fichiers *staged* sont réindexés. Cas limite des fichiers
  *partiellement staged* (`git add -p`) non couvert.

## Alternatives considérées

### Lint type-aware via OxLint (`tsgolint`)
**Rejetée.** Le moteur `tsgolint` (typescript-go) impose de retirer `baseUrl` du `tsconfig.json`,
ce qui casse les nombreux imports « bare » du projet (`domain/...`, `types`, `paths`) — testé :
des centaines d'erreurs `tsc « Cannot find module »`. Une migration hors de `baseUrl` dépasse le
périmètre de ce changement.

### `@typescript-eslint/naming-convention`
**Non portée.** Impossible via `jsPlugins` (la règle appelle `getParserServices` dès `create()`,
or `jsPlugins` ne fournit pas de `parserServices`), absente de `tsgolint`, et pas d'équivalent
natif OxLint exploitable (`id-match`/`id-length` trop grossiers). Pourra être ajoutée plus tard à
la passe `test:lint:types`.

## Impact

- **Frontend** : `npm run test:lint` (OxLint) + `npm run test:lint:types` (type-aware) + Prettier.
- **Backend** : `ktlintCheck` bloquant en CI ; formatage local réindexé au commit.
- **Production** : aucun impact (outillage de développement / CI uniquement).

## Validation

- ✅ `npm run test:lint` : 0 erreur.
- ✅ `npm run test:type` : OK.
- ✅ Suite de tests unitaires frontend : verte (595 tests).
- ✅ `./gradlew ktlintCheck` : OK (baseline en place).
- ✅ CI « Back & Front » verte sur les commits de la PR.
