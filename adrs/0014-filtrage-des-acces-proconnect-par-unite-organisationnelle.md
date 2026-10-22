# ADR-0014: Filtrage des accès ProConnect par unité organisationnelle et gestion des utilisateurs externes par administration

**Date:** 2026-10-21
**Statut:** Accepté

## Contexte

Jusqu'ici, un utilisateur authentifié via ProConnect pouvait se connecter dès que le domaine de son
e-mail figurait dans `MONITORFISH_OIDC_AUTHORIZED_EMAIL_DOMAINS`. Ce filtre était trop large :

- tous les agents du Ministère venant de **Cerbère** (y compris les prestataires, par exemple
  `organizational_unit=SG/DNUM/PNM/DPNM4/Prestataire`) avaient accès à l'application
  ([#4660](https://github.com/MTES-MCT/monitorfish/issues/4660)) ;
- les utilisateurs **externes** (Douane, Gendarmerie maritime, Gendarmerie nationale) n'étaient pas
  rattachés à leur administration, et la table `user_authorizations` ne contenait que des e-mails hachés : il
  était impossible de lister les utilisateurs ou de faire la revue annuelle des habilitations
  ([#4661](https://github.com/MTES-MCT/monitorfish/issues/4661)).

ProConnect renvoie toujours le claim `idp_id` (fournisseur d'identité utilisé) et, sur demande du
scope `organizational_unit` (à faire activer par le support ProConnect), l'unité organisationnelle
de l'agent.

Les fournisseurs d'identité concernés (configuration ProConnect, environnement RIE) :

| Fournisseur d'identité | `idp_id` | Domaine |
|---|---|---|
| Cerbère (Ministère) | `4106b71b-094a-48f0-974a-cb2c2a9649b3` | `developpement-durable.gouv.fr`, préfectures... |
| SSO DOUANE / DGDDI | `aff5881f-3cff-4489-9c95-c0792fc25813` | `douane.finances.gouv.fr` |
| Extensso (Gendarmerie) | `b95309cd-b87d-460d-be2d-f8086965290f` | `gendarmerie.interieur.gouv.fr` |

Gendarmerie maritime et Gendarmerie nationale passent toutes deux par Extensso : l'`idp_id` ne
permet pas de les distinguer, ni de restreindre l'accès aux seuls agents chargés du contrôle des pêches.

## Décision

### Règle d'accès (à la connexion)

Le filtre par domaine d'e-mail est supprimé. Par minimisation des données, seuls les scopes `openid`, `email` et
`organizational_unit` sont demandés à ProConnect (`idp_id` est toujours renvoyé). `GetIsAllowedToLogIn` autorise un utilisateur si :

1. son e-mail est enregistré dans `user_authorizations` (super-utilisateurs CNSP et utilisateurs
   externes listés par administration) **et** il se connecte avec le fournisseur d'identité attendu : Cerbère pour les
   super-utilisateurs, SSO DOUANE pour la Douane (`MONITORFISH_OIDC_DOUANE_IDP_ID`), Extensso pour les Gendarmeries
   (`MONITORFISH_OIDC_EXTENSSO_IDP_ID`). L'`idp_id` et le `sub` ProConnect de la première connexion sont enregistrés, et
   les connexions suivantes doivent les présenter : l'e-mail seul ne suffit pas, car n'importe quel fournisseur
   d'identité de la fédération ProConnect pourrait l'affirmer. Pour réinitialiser ce rattachement (compte recréé par le
   fournisseur d'identité), supprimer puis ajouter de nouveau l'utilisateur ;
2. **ou** il vient de Cerbère (`idp_id == MONITORFISH_OIDC_CERBERE_IDP_ID`) et son
   `organizational_unit` est égale à, ou commence par `<valeur>/`, l'une des unités de la table
   `authorized_organizational_units` (comparaison insensible à la casse).

`MONITORFISH_OIDC_BYPASS_EMAIL_DOMAINS_FILTER` est renommée `MONITORFISH_OIDC_BYPASS_LOGIN_FILTER`.
`MONITORFISH_OIDC_CERBERE_IDP_ID` vaut par défaut l'`idp_id` de Cerbère en production.

### Données

- `user_authorizations` reçoit les colonnes `email` (en clair) et `administration` (enum
  `external_administration` : `DOUANE`, `GENDARMERIE_MARITIME`, `GENDARMERIE_NATIONALE`). `hashed_email` reste la clé : les lignes existantes restent valides et
  leur e-mail est complété à la prochaine connexion de l'utilisateur.
- `user_authorizations` reçoit aussi les colonnes `idp_id` et `sub` (identité ProConnect liée à la première connexion).
- Nouvelle table `authorized_organizational_units`.
- Nouvelle table `authorization_audit_logs` (auteur, action, cible, détail, date), alimentée par toutes les
  modifications des habilitations (backoffice et API publique) : en ajout seul, sans route de modification ni de
  suppression.

### Backoffice

Une page « Utilisateurs », réservée aux super-utilisateurs **administrateurs** (chemins de l'API listés dans
`MONITORFISH_API_PROTECTED_ADMINISTRATOR_PATHS`), permet de :

- lister les utilisateurs et les filtrer par e-mail ou par administration ;
- ajouter un utilisateur : CNSP (super-utilisateur, avec son service) ou externe (avec son administration) ;
- lors de la revue des habilitations, **remplacer** la liste des utilisateurs d'une administration
  en collant une liste d'e-mails ou en important un fichier CSV (aperçu des ajouts et suppressions avant validation). Les
  super-utilisateurs ne sont jamais ajoutés ni supprimés par cette opération ;
- donner ou retirer les droits d'administrateur d'un utilisateur CNSP (un administrateur ne peut ni retirer ses
  propres droits, ni se supprimer, et le dernier administrateur ne peut pas être retiré) ;
- consulter la date de dernière connexion de chaque utilisateur listé (`last_login_at_utc`, enregistrée à la connexion) ;
- gérer, dans un onglet séparé « Services autorisés (Cerbère) », les unités organisationnelles Cerbère autorisées
  (présentées comme le « service » de l'agent, plus parlant pour les utilisateurs ; le champ CNSP « Service » devient
  « Pôle CNSP » pour éviter la confusion) ;
- consulter, dans la page « Journal des habilitations », l'historique des modifications des habilitations (filtré et paginé
  côté serveur, la table ne faisant que grossir).

Lors du remplacement de la liste d'une administration, les utilisateurs d'une autre administration sont déplacés (et
signalés comme tels), et une liste vide doit être explicitement confirmée.

Les routes `/bff/v1/admin/*` sont toujours réservées aux administrateurs, même si
`MONITORFISH_API_PROTECTED_ADMINISTRATOR_PATHS` est absente.

### Sécurité de la session

- Le cookie de session est `HttpOnly`, `SameSite=Lax` et `Secure` (`MONITORFISH_SESSION_COOKIE_SECURE`).
- Les modifications sur `/bff` exigent un jeton CSRF (cookie `XSRF-TOKEN` renvoyé dans l'en-tête `X-XSRF-TOKEN`), et
  seules les origines du frontend (`MONITORFISH_OIDC_ALLOWED_ORIGINS`, par défaut celle de
  `MONITORFISH_OIDC_SUCCESS_URL`) peuvent l'appeler en CORS. Les routes `/api`, appelées par MonitorEnv et RapportNav
  avec la clé d'API, restent ouvertes à toutes les origines et sans jeton CSRF.
- La réponse userinfo de ProConnect (JWT signé) est vérifiée avec les clés du fournisseur, et son `sub` doit être celui
  de l'ID token.

### Environnement local et E2E

Le Keycloak local imite ProConnect : userinfo renvoyé en JWT signé (`application/jwt`), scopes nommés
comme ceux de ProConnect (`given_name`, `usual_name`, `uid`, `siret`, `organizational_unit`,
`belonging_population`...), claims `idp_id` et `organization_label` toujours renvoyés. Les
utilisateurs de test couvrent chaque cas de la règle d'accès, et le filtre est actif dans les tests
Cypress.

## Conséquences

### Positives

- Les accès du Ministère sont restreints aux services concernés, sans maintenir de liste d'e-mails.
- Les accès externes sont nominatifs, rattachés à une administration, et révisables en une opération.

### Négatives / points d'attention

- **Données personnelles :** les e-mails sont désormais stockés en clair.
- **Mise en production :** un utilisateur externe qui se connectait grâce au seul domaine de son
  e-mail, sans ligne dans `user_authorizations`, perd l'accès. Avant le déploiement, il faut importer
  les listes de chaque administration externe, renseigner les unités organisationnelles autorisées et
  faire activer le scope `organizational_unit` par ProConnect.
- La règle n'est évaluée qu'à la connexion : un utilisateur retiré garde l'accès jusqu'à
  l'expiration de sa session.
- **Mise en production :** les super-utilisateurs CNSP doivent se connecter via Cerbère, et les utilisateurs déjà
  enregistrés sont rattachés à l'identité ProConnect de leur prochaine connexion.
