# Logging des APIs backend

Date: 17/04/2024

## Statut

Résolu.

## Contexte

Nous utilisions auparavant un simple `CommonsRequestLoggingFilter` pour le logging des requêtes dans notre application. Cependant, cette approche ne nous permettait pas d'inclure les payloads de requêtes et ne permettait pas l'ajout d'identifiants de corrélation dans les logs.

## Décision

Pour améliorer la traçabilité des requêtes et inclure les payloads de requêtes ainsi que les identifiants de corrélation dans les logs, nous avons décidé de mettre en place une architecture de logging plus robuste. Cette architecture consiste en trois composants principaux :

1. `LogGETRequests` : Intercepte les requêtes GET.

2. `LogRequestsWithBody` : Intercepte les requêtes PUT et POST pour enregistrer les détails de la requête, y compris le corps de la requête (payload), dans les logs.

3. `LogResponseWithBody` : Intercepte les réponses des requêtes PUT et POST pour enregistrer les détails de la réponse, y compris le corps de la réponse, dans les logs.

## Conséquences

- Amélioration de la traçabilité des requêtes dans l'application.
- Inclusion des payloads de requêtes et des identifiants de corrélation dans les logs, ce qui facilite le diagnostic des problèmes.
- Remplacement de l'utilisation antérieure du `CommonsRequestLoggingFilter` par une solution plus flexible et adaptée à nos besoins spécifiques en matière de logging.
