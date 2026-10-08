# ADR-0012: Remplacement de SmallChat par un envoi des retours utilisateurs vers un salon Tchap

**Date:** 2026-10-07
**Statut:** Accepté

## Contexte

Depuis 2024, les utilisateurs contactaient l'équipe MonitorFish via le widget **SmallChat**, une
bulle de discussion reliée à Slack :

- le hook `useSmallChat` injectait au premier rendu de `App` une balise `<script>` pointant vers
  `/proxy/scripts/smallchat.js` (désactivée sous Cypress) ;
- le backend servait ce script via `ScriptProxyController`, qui le téléchargeait depuis
  `https://embed.small.chat/T0176BBUCEQC01SV3W4464.js` et le gardait 24 h dans le cache Caffeine
  `smallchat_script`.

Ce montage posait plusieurs problèmes :

1. **Du code tiers exécuté dans l'application.** Le script, non versionné et non relu, s'exécutait
   avec les mêmes droits que le frontend, sur une application manipulant des données de contrôle
   des pêches. Le proxy ne faisait que relayer son contenu.
2. **Une dépendance à un service externe et à Slack.** Les échanges transitaient par SmallChat et
   un espace Slack, hors des outils de l'État, et le widget dépendait de la disponibilité
   d'`embed.small.chat`.

**Tchap**, la messagerie de l'État (basée sur Matrix), est déjà utilisée par l'équipe et permet de
poster dans un salon via un compte bot
([documentation](https://doc.incubateur.net/communaute/les-outils-de-la-communaute/tchap#bots-customs)).

## Décision

SmallChat est retiré (`useSmallChat`, `ScriptProxyController` et le cache `smallchat_script` sont
supprimés). Il est remplacé par un **formulaire de retour natif** dont les messages sont postés
**par le backend** dans un salon Tchap.

### Frontend

- Un bouton « Nous contacter » (`UserFeedbackMapButton`, `MapBox.USER_FEEDBACK`) ouvre, dans le
  menu en bas à droite de la carte, un `MapMenuDialog` contenant un message (2000 caractères max)
  et des captures d'écran en pièces jointes.
- L'URL de la page courante est jointe automatiquement.
- La mutation RTK Query `sendUserFeedback` (`POST /bff/v1/user_feedback`) est configurée avec
  `maxRetries: 0` : un nouvel essai automatique pourrait poster plusieurs fois le même message.
- Le bouton n'est affiché que si `FRONTEND_TCHAP_ENABLED === 'true'`.

### Backend

- `UserFeedbackController` récupère l'e-mail de l'utilisateur depuis le principal OIDC : l'auteur
  n'est pas une donnée saisie par le client.
- Le use case `SendUserFeedback` valide le retour : message non vide et ≤ 2000 caractères,
  5 pièces jointes au plus, de type PNG, JPEG ou WebP, chacune ≤ 5 Mo ; l'URL de page est
  tronquée à 500 caractères.
- `TchapUserFeedbackRepository` (implémentation de `UserFeedbackRepository`) parle directement
  l'API client Matrix :
  1. **téléverse d'abord** les images (`/_matrix/media/v3/upload`), pour qu'un fichier rejeté ne
     laisse pas un message texte orphelin dans le salon ;
  2. poste le message texte (`m.text`, HTML échappé) puis un message `m.image` par pièce jointe
     (`PUT …/send/m.room.message/{txnId}`, avec un `txnId` aléatoire).
- Le salon doit être **non chiffré** : le bot poste en clair, sans gestion du chiffrement de bout
  en bout.
- Si Tchap est désactivé ou incomplètement configuré, le retour n'est pas envoyé et un
  avertissement est loggé ; une erreur d'appel Matrix remonte en `BackendInternalException`.

### Configuration

| Variable                             | Rôle                                                               |
|--------------------------------------|--------------------------------------------------------------------|
| `MONITORFISH_TCHAP_ENABLED`          | Active l'envoi backend et, via `FRONTEND_TCHAP_ENABLED`, le bouton |
| `MONITORFISH_TCHAP_HOMESERVER_URL`   | Homeserver Matrix (défaut : `https://matrix.agent.dinum.tchap.gouv.fr`) |
| `MONITORFISH_TCHAP_ACCESS_TOKEN`     | Jeton d'accès du compte bot                                        |
| `MONITORFISH_TCHAP_FEEDBACK_ROOM_ID` | Identifiant du salon recevant les retours                          |

En déploiement (`infra/remote/docker-compose.yml`), `FRONTEND_TCHAP_ENABLED` est alimentée par
`MONITORFISH_TCHAP_ENABLED` : un seul interrupteur pilote le bouton et l'envoi.

## Conséquences

### Positives

- Plus aucun script tiers n'est chargé dans l'application, ni proxifié par le backend.
- Les retours arrivent dans un outil de l'État, avec l'auteur authentifié, la page concernée et
  les captures d'écran.
- Le flux est testé de bout en bout : tests unitaires du use case, tests d'intégration du
  contrôleur et du repository Matrix, test Cypress `user_feedback.spec.ts`.
- La fonctionnalité se coupe par variable d'environnement, sans redéploiement de code.

### Négatives / points d'attention

- **Le canal est à sens unique.** SmallChat permettait de répondre en direct dans le widget ; ici
  l'équipe répond hors de l'application (par e-mail, grâce à l'adresse jointe au message).
- **Le jeton du bot est un secret** à stocker et à renouveler côté infrastructure ; s'il expire,
  les envois échouent (erreur 500 côté utilisateur, message « Nous n'avons pas pu envoyer votre
  message. »).
- **Le salon doit rester non chiffré**, ce qui exclut d'y faire transiter des informations
  sensibles au-delà du retour lui-même.
- L'envoi est synchrone (`runBlocking`) dans la requête HTTP : avec plusieurs images, la réponse
  dépend de la latence du homeserver Tchap.
- Pas de garantie d'unicité en cas d'échec partiel : si un `PUT` d'image échoue après le message
  texte, le texte reste posté sans toutes ses images.
