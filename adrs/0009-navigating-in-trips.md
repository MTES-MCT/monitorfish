# Visualisation des données déclaratives et de position par marée

Date: 2025-10-01

## Statut

Résolu

## Contexte

L'application permet à l'utilisateur de visualiser les données déclaratives et de position des navires par **marée** afin d'offrir une vue cohérente de l'ensemble des données d'une même marée.

Cette navigation doit permettre à l'utilisateur :
1. De visualiser la dernière marée (vue par défaut quand on sélectionne un navire)
2. De naviguer dans les marées en sélectionnant la marée suivante / précédente
3. De visualiser une marée à partir d'un numéro de marée

## Option 1 - Navigation à partir des données déclaratives sources

La première option, implémentée dans le logiciel depuis sa mise en production, est de chercher les informations demandées par l'utilisateur directement dans les données déclaratives (table `logbook_reports`).

Avantages :
1. Simplicité de l'architecture : il s'agit simplement de requêter la table existante de données déclaratives
2. Données toujours à jour : en requêtant directement les données sources, le résultat renvoyé est toujours à jour des dernières données reçues

Inconvénients :
1. Complexité de la logique à implémenter dans le back / les requêtes pour trouver les dates de début et fin de marée sans erreur
2. Risque de rendre certaines données inaccessibles dans l'application en cas de dates de marées qui se chevauchent
3. Plusieurs requêtes ne pouvant pas tirer parti des partitions TimescaleDB doivent être faites, ce qui rend la navigation peu performante
4. Les performances se dégradent au fur et à mesure de l'augmentation du volume de données en base

## Option 2 - Création d'une table de marées

Une autre option est de crée une table de marées indiquant les dates utiles à la navigation dans les marées et qui serve d'index déporté pour la table `logbook_reports`.

Avantages :
1. Simplification de la logique back
2. Amélioration des performances
3. Elimination des requêtes ne pouvant pas exploiter le partionnement TimescaleDB --> pas de dégration des performances à long terme

Inconvénients :
1. Augmentation de la complexité architecturale avec une nouvelle table et un nouveau flow
2. Dépendance à la data warehouse
  
## Décision

Passer à l'option 2 car l'option 1 en place depuis 2021 donne désormais des perforances trop dégradées dont se plaignent régulièrement les utilisateurs. L'option 2 est la réponse pérenne à ce problème.

## Conséquences

- Mise en place d'une table `trips_snapshot` mise à jour par la pipepine à partir de la data warehouse
- Mise à jour des use cases back de navigation  pour exploiter cette table.

## Principes de fonctionnement

- La table `trips_snapshot` sera mise à jour de façon régulière, par exemple une fois par jour, mais ne pourra pas contenir de données à jour en temps réel. Pour cette raison, les use cases back devront faire une jointure entre les données historiques de la table `trips_snapshot` et les données déclaratives reçues ultérieurement à la dernière mise à jour de la table `trips_snapshot`.
- Les données déclaratives sont datées à la fois par **date d'activité** - la date à laquelle l'activité déclarée a réellement lieu - et par **date de transmission** - la date d'envoi du message JPE via le réseau satellitaire ou la date de saisie dans VisioCaptures pour les données saisies a posteriori.
- La date qui a du sens d'un point de vue usager est la date d'activité. C'est sur cette date que la logique de navigation (marée "suivante", marée "précédente") doit s'appuyer, ainsi que la sélection des positions VMS correspondant à la marée.
- Messages supprimés / corrigés --> sont à inclure lors la détermination de la plage de dates transmission d'une marée (car on veut les faire remonter dans l'app pour pouvoir les afficher en tant que message supprimé ou corrigé) mais pas lors la détermination de la plage de dates d'activité d'une marée (car les dates d'activité doivent être prises dans les messages valides non supprimés ni corrigés).
- Numéros de marée calculés : les messages sans numéro de marée se voient attribuer un numéro de marée par le flow `missing_trip_numbers`. Une fois cette attribution faite, la navigation dans ces messages se fait avec la même logique que les autres messages.