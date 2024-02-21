# Stratégie de gestion des variables d'environnement de Docker et du Frontend

Date: 21/02/2024

## Statut

Résolu.

## Contexte

Nous commitions nos fichiers de variables d'environnement avec des valeurs par défaut jusqu'alors dans
`/infra/configuration/.env.[environment]`.

Mais deux besoins sont apparus :

- Sécuriser les variables d'environnement qui ne sont pas sensées être committées (même si les clés que nous partagions
  ne représentaient pas de risque particulier car ce sont des clés d'accès à des APIs de données publiques).
- Pouvoir surcharger localement les variables d'environnement partagées pour les adapter à des besoins de développement
  spécifiques (ex : activer/désactiver certains feature flags).

Tout en conservant la possibilité de partager les variables d'environnement partagées entre les membres de l'équipe
ainsi que d'éventuel.les contributeur.icess open-source.

Le problème est qu'il existe différentes stratégie et conventions concernant l'orgnisation des fichiers `.env*`,
dépendants du framework, des librairies de parsing, des outils de build et de runtime utilisés. Sans qu'aucune ne soit
devenue une référence de facto.

### Dotenv

- https://www.dotenv.org/docs/security

Dotenv a un stratégie basée simplement sur des `.env` et `.env.[environment]` (ex : `.env.production`), qui doivent être
ignorés par Git et partagés via un `.env.vault` qui lui est committé. Un `.env.me`, lui aussi ignoré par Git, est unique
à chaque contributeur.ice et permet de dévérrouiller le `.env.vault`.

> The .env.vault file uniquely identifies your project in dotenv-vault. You SHOULD commit this file to source control.
> It is safe to do so. Aside: DON'T commit your .env or .env.me to source control.

### Vite

- https://vitejs.dev/guide/env-and-mode.html#env-variables-and-modes

Vite a une stratégie basée sur des `.env` et `.env.[mode]` (i.e `.env.production`), qui sont partageables via Git alors
que les `.env.local` et `.env.[mode].local` soivent ignorés par Git. Les `.env.local*` permettent de surcharger
localement les `.env*` partagés.

> ```
> .env                # loaded in all cases
> .env.local          # loaded in all cases, ignored by git
> .env.[mode]         # only loaded in specified mode
> .env.[mode].local   # only loaded in specified mode, ignored by git
> ```

### `import-meta-env`

Cette librairie regroupe un ensemble d'outils et de librairies pour injecter des variables d'environnements au runtime
dans une SPA. Comme expliqué dans l'[ADR 0001](0001-frontend-runtime-env-var-injection.md), nous avons choisi d'utiliser
`@import-meta-env/cli` pour injecter ces variables d'environnement dans notre Frontend.

Pour rappel, deux fichiers y sont attendus par défaut :

- `.env.example` : committé par Git, sert à définir les **variables** d'environnement requises par l'application.
- `.env` : pas de précision concernant Git, sert à définir les **valeurs** par défaut des variables d'environnement.

Il existe cependant un autre outil, `@import-meta-env/prepare`, qui permet de générer des fichiers `.env` à la volée à
partir d'un fichier `.env.local.defaults` partagé, surchargé d'un fichier `.env.local` s'il est présent :

- `.env.local.defaults` : committé via Git, sert à définir les **valeurs** par défaut des variables d'environnement.
- `.env.local` : ignoré par Git, sert à surcharger localement les valeurs par défaut.
- `.env` : ignoré par Git, généré automatiquement à partir des deux fichiers précédents par `import-meta-env-prepare`.

> ```
> Usage: import-meta-env-prepare [options]
>
> Generate `.env` file from `.env.*` files.
>
> Options:
>   -e, --env <path>        .env file path to write (default: ".env")
>   -x, --example <path>    .env.example file path to read
>   -p, --path <path...>    .env.* file paths to read (default:
>                           [".env.local.defaults",".env.local"])
>   -u, --user-environment  whether to load user environment variables (i.e.,
>                           process.env.*) (default: false)
> ```

## Décision

Comme il n'existe pas de convention générale, et que nous avons déjà choisi d'utiliser `import-meta-env` pour
implémenter et injecter les variables d'environnement du Frontend, nous avons choisi ce qui nous semblait le plus simple
en utilisant aussi leur outil `@import-meta-env/prepare`. Cela comprends leur convention et s'applique maintenant aussi
aux variables d'environnement de Docker, pas soucis de cohérence.

## Conséquences

Nous nous retrouvons donc avec cette structure :

| Fichier                             | Contexte | Git     | Description                                                           |
| ----------------------------------- | -------- | ------- | --------------------------------------------------------------------- |
| `/frontend/.env.example`            | Frontend | OUI     | Définit les **variables** d'environnement requises par l'application. |
| `/frontend/.env.local.defaults`     | Frontend | OUI     | Définit les **valeurs** par défaut des variables d'environnement.     |
| `/frontend/.env.local`              | Frontend | **NON** | Surcharge localement les valeurs par défaut. Non obligatoire.         |
| `/frontend/.env`                    | Frontend | **NON** | Automatiquement généré (`.env.local.defaults` + .`.env.local`).       |
| `/infra/docker/.env.local.defaults` | Docker   | OUI     | Définit les **valeurs** par défaut des variables d'environnement.     |
| `/infra/docker/.env.local`          | Docker   | **NON** | Surcharge localement les valeurs par défaut. Non obligatoire.         |
| `/infra/docker/.env`                | Docker   | **NON** | Automatiquement généré (`.env.local.defaults` + .`.env.local`).       |

> [!NOTE]
> Vous noterez qu'il n'y a pas de `.env.example` pour les variables d'environnement de Docker. Le `.env.example` ne sert
> en effet qu'à valider l'injection des variables d'environnement au runtime, ce qui n'a pas de sens pour Docker.
