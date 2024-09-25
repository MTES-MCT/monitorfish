# Refonte de la deuxième fenêtre (`SideWindow`)

Date: 2024-09-25

## Statut

Résolu

## Contexte

Le ticket [#3211](https://github.com/MTES-MCT/monitorfish/issues/3211) est impactant pour les utilisateurs : il empêche le clic dans un `<Select/>` après avoir scrollé dans une liste. 

Le bug est reproductible seulement dans `window.open()`, avec notre implémentation de `NewWindow`.

> Les portals semblent plus adaptés aux scénarios simples dans un seul contexte DOM, tandis que l'approche avec BroadcastChannel et une nouvelle URL semble plus robuste pour des interfaces complexes réparties sur plusieurs fenêtres.

## Option 1 - React portal

Nous avions copié la libairie `react-new-window` dans [monitor-ui](https://github.com/MTES-MCT/monitor-ui/blob/d1294389097d528637c481ada8ea9ad1514f2640/src/components/NewWindow.tsx#L44) :
- Utilise `ReactDOM.createPortal()`
- Copie de tous les styles à la main

Avantages :
1. Chargement rapide: Un React Portal vous permet d'injecter un composant dans une autre partie du DOM sans quitter l'application principale, ce qui permet de ne pas re-charger les assets de l'application.
2. Sans communication interfenêtres : Pas besoin d'utiliser des mécanismes complexes de synchronisation, tout se passe dans la même instance de React.

Inconvénients :
1. Il y a des bugs d'affichages (notamment sur des `<Select />` contenant beaucoup d'éléments) 
2. Si la première fenêtre est supprimée, la deuxième est orpheline (clic impossible)

## Option 2 - Nouvelle fenêtre synchronisée avec `BroadcastChannel`

Avantages :
1. Séparation claire des responsabilités : Chaque fenêtre a son propre cycle de vie et son propre DOM, ce qui rend la gestion des deux interfaces plus propre et modulaire.
2. Communication efficace : BroadcastChannel est conçu pour la synchronisation des états entre différentes fenêtres, ce qui permet une synchronisation rapide et efficace sans prop drilling ou complexité supplémentaire.

Inconvénients :
1. Complexité de la gestion de l’état : Il est nécessaire de gérer la logique de synchronisation entre les fenêtres manuellement, ce qui peut introduire des erreurs si les états deviennent désynchronisés.
2. Temps de chargement : Ouvrir une nouvelle URL nécessite un chargement complet d’une nouvelle page, ce qui augmente le temps de réponse initial par rapport à un React Portal.
3. `RTK Query` ne peut pas être synchronisé avec `BroadcastChannel`, à cause des objets passés non-sérialisables
4. Il faut limiter le nombre de fenêtres pour éviter d'avoir deux fenêtres principales (MainWindow)

## Décision

_À rédiger._

## Conséquences
