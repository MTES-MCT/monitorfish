# Test end-to-end (e2e) multi-fenêtres pour la synchronisation des missions

Date: 17/01/2024

## Statut

Résolu, à approfondir.

## Contexte

Les tests de synchronisation du formulaire des missions sont :
- Fastidieux à effectuer (il faut ouvrir plusieurs fenêtre et switcher entre celles-ci) et difficile à repliquer
- Impossible à exécuter de manière automatique dans `Cypress`

En se basant sur [cet article](https://liveblocks.io/blog/e2e-tests-with-puppeteer-and-jest-for-multiplayer-apps), `Puppeteer` a été choisi comme pour tester
sur plusieurs fenêtres.

### `Puppeteer`

L'outil est simple à mettre en place et se focalise seulement sur la manipulation d'un navigateur depuis `NodeJS`.
Nous utilisons `jest` pour écrire les assertions.

Il est possible de tester en mode `headless` (pour la CI) ou `headfull` (pour développer).

Les tests ont été concluants et permettent d'avoir un premier jeu de tests de la synchronisation des missions, voir `puppeteer/e2e/*.spec.ts`.

## Décision

`Puppeteer` est ajouté dans la CI de tests e2e.

## Conséquences

Une deuxième librairie de test e2E a été ajoutée, attention à bien utiliser `Puppeteer` seulement pour les tests de plusieurs fenêtres.

à creuser :
- L'utilisation de `Puppeteer` pour les tests de `SideWindow` (ouvertes avec `document.open()`)
