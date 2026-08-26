# ADR-0011: Enregistrement automatique des formulaires — sérialisation des sauvegardes, identité client des brouillons et rejet des échos SSE

**Date:** 2026-08-26
**Statut:** Accepté

## Contexte

Le formulaire de mission (`MissionForm`) n'a pas de bouton « Enregistrer » : il sauvegarde seul,
500 ms après chaque pause de frappe. Le pôle ops a signalé
([#5368](https://github.com/MTES-MCT/monitorfish/issues/5368)) deux symptômes concomitants et
« occasionnels » :

- les champs de la colonne de gauche (contact de l'unité, numéro de téléphone) **s'effacent** à
  mesure que l'opérateur les remplit ;
- une **deuxième mission** s'ouvre, et/ou le **contrôle est dupliqué**.

Les logs de production du 26/08 (mission 43969) montrent la mécanique :

```
04:57:11  POST /bff/v1/mission_actions      → crée le contrôle 20632
04:58:07  POST /bff/v1/mission_actions      → crée le contrôle 20633   (doublon, 56 s plus tard)
05:26:35  PUT  /mission_actions/20632       comments: "A L4EAU "
05:26:39  PUT  /mission_actions/20632       comments: "A L4EAU - 600 "
   …une vingtaine de PUT pour une seule phrase…
```

Une pause de 500 ms est plus courte qu'une pause humaine normale (lire le formulaire papier,
chercher une touche) : le *debounce* se déclenchait donc à presque chaque respiration. Rien ne
bornait la concurrence, si bien que sur un réseau lent les sauvegardes se **chevauchaient**, et
quatre défauts se déclenchaient alors :

1. **L'identité tardive.** Le choix création/mise à jour reposait sur « cet objet a-t-il un `id` ? ».
   Or l'`id` n'arrive qu'avec la réponse du serveur : une sauvegarde partie pendant une création en
   vol reposait la question, obtenait « non », et créait un doublon.
2. **Les fermetures périmées.** Quatre gardes du type
   `if (debounce.isPending()) setTimeout(retry, 500)` reprogrammaient une fonction qui emportait une
   **photo figée** du formulaire. Tant que l'opérateur tape, le rappel se reprogramme indéfiniment,
   et finit par s'exécuter avec des données vieilles d'une minute — d'où le POST de 04:58:07.
3. **L'écho SSE.** MonitorEnv diffuse chaque modification à tous les clients, **y compris à celui qui
   l'a émise**. Cet écho était appliqué de force au formulaire, sans comparaison de fraîcheur, puis
   **renvoyé au serveur** : l'effacement devenait définitif et se propageait aux autres postes.
4. **La réinitialisation à la création.** `<MainForm>` est recréé quand l'`id` de mission apparaît
   (`key={missionId}`) : il était réinitialisé avec les valeurs *envoyées* dans la requête de
   création, perdant tout ce qui avait été tapé pendant celle-ci.

Le sujet mérite une décision car le motif « formulaire auto-sauvegardé » est **transverse** : le
formulaire de signalement (`autoSaveReporting`) décide lui aussi création/mise à jour sur
`editedReportingId ?? autoSavedReporting?.id`, avec une référence renseignée seulement *après* la
réponse de création — la même fenêtre de duplication existe donc structurellement.

## Décision

Six règles s'appliquent désormais à l'enregistrement automatique du formulaire de mission, et
constituent le motif de référence pour tout formulaire auto-sauvegardé :

1. **Une seule sauvegarde en vol par entité, la dernière charge utile gagne.** Les sauvegardes
   demandées pendant qu'une autre tourne sont remplacées par la suivante : seule la dernière mérite
   d'être persistée. Le débit est ainsi plafonné à un aller-retour par entité, quel que soit le
   rythme de frappe — plus le réseau est lent, moins il y a de requêtes.
2. **Un brouillon a une identité client avant d'avoir un `id` serveur** (`draftKey`). L'`id` de la
   base n'est *pas* l'identité tant que le serveur n'a pas répondu.
3. **Un évènement SSE qui n'est pas strictement plus récent que la dernière sauvegarde locale est
   ignoré** : c'est soit notre propre écho, soit une mise à jour dépassée.
4. **On ne reprogramme jamais une fonction *debounced* périmée** : on force son exécution
   (`flush()`) et on l'attend.
5. **Les rappels asynchrones lisent l'état dans une référence, jamais dans la copie capturée par
   leur fermeture.**
6. **Le *debounce* mesure des pauses, il ne borne pas le débit** : il est complété par un `maxWait`
   (fenêtre maximale non sauvegardée) et un `flushOnExit` (sortie du formulaire, fermeture de page).

## Implémentation

- **`frontend/src/utils/createLatestOnlySaver.ts`** — règle 1. Une sauvegarde par clé à la fois ;
  les suivantes sont mises en attente et supplantées par la plus récente. Générique et testé
  isolément. Sa sérialisation rend inutile tout verrou de création séparé.
- **`useCases/autoSaveMissionAction.ts`** — règles 1 et 2. Registre `draftKey → id` des actions
  créées dans la session ; une sauvegarde dont les valeurs ne portent pas encore l'`id` y retrouve
  l'action et met à jour au lieu de dupliquer. Les sauvegardes dont la charge utile est inchangée
  sont ignorées (ce que `autoSaveMission` faisait déjà).
- **`useCases/saveMission.ts`** — règles 1 et 2, transposées à la mission
  (`createdMission` mémorisé pour la session).
- **`MissionForm/sse.ts` + `MainForm/FormikSyncMissionFields.tsx`** — règle 3, via
  `isMissionEventStale()` et `missionForm.lastSavedUpdatedAtUtc`.
- **`MissionForm/hooks/useMissionFormAutoSave.ts`** — règles 4, 5 et 6, et sortie de toute
  l'orchestration hors du composant (`index.tsx` : 714 → 441 lignes, rendu uniquement).
- **`SideWindow/useCases/cleanMissionForm.ts`** — remise à zéro des registres à la fermeture.

## Avantages

- Les deux symptômes signalés disparaissent, et surtout leur **cause commune** est supprimée : la
  concurrence est bornée par construction plutôt que rattrapée au cas par cas.
- Le débit de requêtes s'autorégule sur la latence réseau au lieu de croître avec elle.
- La logique de sauvegarde devient testable hors composant.

## Inconvénients / Réserves

- Les registres sont des **états de module**, donc par onglet : ils doivent être remis à zéro à la
  fermeture du formulaire (`cleanMissionForm`) et dans les tests (`resetMissionSaves()`,
  `resetMissionActionSaves()`). C'est un couplage implicite, à ne pas oublier en ajoutant un
  formulaire.
- La fraîcheur SSE repose sur l'ordre des `updatedAtUtc` produits par le serveur. Entre **deux
  postes**, cela reste une comparaison d'horodatages, pas une identification de l'émetteur.
- `flushOnExit` couvre le démontage et la fermeture de page, mais un `PUT` parti au tout dernier
  moment peut encore être coupé (voir l'option `keepalive` de `fetch`, non mise en place).
- Le passage à 1 s de *debounce* allonge la fenêtre de travail non sauvegardé ; `maxWait` la borne
  à 10 s.

## Alternatives considérées

- **Sauvegarde à la sortie du champ (`onBlur`)** plutôt qu'à la pause. Colle mieux au remplissage
  d'un formulaire papier et réduirait fortement le nombre de requêtes, mais change le comportement
  produit (un opérateur qui tape puis s'éloigne sans quitter le champ n'est plus couvert) et demande
  un support côté `monitor-ui`. Écarté pour l'instant, à rediscuter.
- **Envoi des seuls champs modifiés (`PATCH`)**. Diviserait la charge par ~50 (2,6 ko par `PUT`),
  mais pas le **nombre** de requêtes, qui est ce qui provoquait les courses. Nécessite du travail
  backend. Reporté.
- **Marque d'origine posée par le serveur sur les évènements SSE** (« c'est ce client qui a émis »),
  au lieu de comparer les `updatedAtUtc`. Plus robuste en édition concurrente ; nécessite une
  évolution MonitorEnv. À retenir si le problème réapparaît à plusieurs postes.
- **Verrou optimiste côté serveur** (rejet d'un `PUT` portant une version périmée). Traite la
  cohérence mais pas le débit, et dégrade l'expérience (erreurs à l'écran pendant la saisie).

## Validation

Tests unitaires (`createLatestOnlySaver`, `autoSaveMissionAction`, `saveMission`,
`FormikSyncMissionFields`, `getUpdatedMissionFromMissionMainFormValues`) et
`cypress/e2e/side_window/mission_form/auto_save_races.spec.ts`, qui ralentit volontairement les
réponses de création (`delay`) pour rendre le chevauchement déterministe.

Chaque test a été vérifié **en échec sans les correctifs** :

| Test e2e | Sans les correctifs | Avec |
| --- | --- | --- |
| Mission créée une seule fois | 2 créations | 1 |
| Contrôle créé une seule fois | 2 créations | 1 |
| Champ non effacé par l'écho | champ vidé | conservé |
| Rafale de frappe → une sauvegarde | 3 requêtes | 1 |

À noter : c'est le test navigateur qui a révélé deux défauts que les tests unitaires masquaient —
la mise à jour partant vers `/api/v1/missions/undefined` (le *bouchon* de test inversait l'ordre
de priorité de l'`id`) et la réinitialisation du formulaire à la création (défaut 4 ci-dessus).
Les tests unitaires de thunk doivent refléter l'ordre réel des champs de la fonction bouchonnée.

## Suites

- Appliquer les règles 1 et 2 au formulaire de signalement (`autoSaveReporting`), qui présente la
  même fenêtre de duplication.
- Mesurer en production le nombre de requêtes par saisie après passage à 1 s, et arbitrer alors
  entre `onBlur` et un `debounce` plus long.
