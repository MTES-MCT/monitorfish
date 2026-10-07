# ADR-0013: Publication des types de l'API publique dans un package Kotlin `monitorfish-api-contract`

**Date:** 2026-10-07
**Statut:** Accepté

## Contexte

L'API publique de MonitorFish (`/api/v1/...`) est consommée par d'autres applications, notamment
**RapportNav**, qui lit les actions de mission (`GET /api/v1/mission_actions`), en modifie
certaines (`PATCH /api/v1/mission_actions/{id}`) et lit les navires et les ports.

Les types de ces réponses n'existaient que dans le module backend, au milieu des DTO de la BFF :
`MissionActionDataOutput`, `PublicMissionActionDataOutput`, `PatchableMissionActionDataInput`,
`VesselIdentityDataOutput`, `PortDataOutput`, etc. Ils portaient leur propre conversion depuis le
domaine (`MissionActionDataOutput.fromMissionAction`, `PublicMissionActionDataOutput.fromEnriched`)
et référençaient directement les enums du domaine.

Les consommateurs devaient donc **recopier ces classes** dans leur code. Chaque copie dérivait
sans que rien ne le signale : un champ ajouté, une constante d'enum renommée ou un champ rendu
obligatoire côté MonitorFish ne se découvrait qu'à l'exécution, à la désérialisation chez le
consommateur.

Publier ces classes telles quelles n'était pas possible : elles dépendaient du domaine (enums,
entités dans les `companion object`), et donc de tout le backend.

## Décision

Les types de l'API publique sont extraits dans un **sous-projet Gradle `backend/api-contract`**,
publié sur GitHub Packages sous `fr.gouv.cnsp:monitorfish-api-contract`. Le backend en dépend
(`api(project(":api-contract"))`) et sert ces types tels quels : MonitorFish et ses consommateurs
utilisent **les mêmes classes**.

### Contenu du contrat

| Endpoint                               | Type                                                                        |
|----------------------------------------|-----------------------------------------------------------------------------|
| `GET /api/v1/mission_actions`          | `List<PublicMissionActionDataOutput>` (ou `List<MissionActionDataOutput>`)  |
| `PATCH /api/v1/mission_actions/{id}`   | corps `PatchableMissionActionDataInput`, réponse `PublicMissionActionDataOutput` |
| `GET /api/v1/vessels`                  | `List<VesselIdentityDataOutput>`                                            |
| `GET /api/v1/ports`                    | `List<PortDataOutput>`                                                      |

S'y ajoutent les sous-types (contrôles d'engins et d'espèces, segments, groupes de navires,
signalements, unités, hiérarchie des menaces) et des **copies des enums du domaine**
(`ControlCheck`, `MissionActionType`, `InfractionType`, `LogbookMessagePurpose`, …), dans le
package `fr.gouv.cnsp.monitorfish.infrastructure.api.contract`.

`MissionActionDataOutput` est aussi la réponse de la BFF (`/bff/v1/mission_actions`) : le frontend
et les consommateurs externes lisent le même type.

### Règles du package

1. **Uniquement des `data class` et des enums**, sans Spring, JPA ni domaine MonitorFish. Les
   seules dépendances sont `jackson-annotations` 2.x (lues par Jackson 2 et Jackson 3, le
   consommateur apporte son runtime) et `nv-i18n` (`CountryCode`).
2. **La conversion domaine → contrat reste dans le backend**, sous forme de fonctions d'extension
   (`MissionAction.toMissionActionDataOutput()`, `toPublicMissionActionDataOutput()`,
   `toPatchableMissionAction()`, …) qui remplacent les `companion object` `from…`.
3. **Les enums du contrat recopient ceux du domaine**, constante par constante. La conversion se
   fait par nom (`Enum<*>.toContract()`, via `enumValueOf(name)`) et `ContractEnumMapperUTests`
   échoue si un enum du domaine et sa copie divergent.
4. **Compatibilité ascendante** : ajouter des champs nullables ou avec valeur par défaut ; ne jamais
   renommer ni supprimer sans période de dépréciation. Les consommateurs désérialisent avec
   `FAIL_ON_UNKNOWN_PROPERTIES` désactivé, pour accepter les champs ajoutés.
5. **`PatchableMissionActionDataInput` garde la sémantique `Optional?`** du PATCH : `null` = champ
   non envoyé, valeur inchangée ; `Optional.empty()` = valeur effacée. Le module Jackson
   `Jdk8Module` est requis (intégré à Jackson 3).

### Versionnement et publication

- La version du contrat est **celle de la release MonitorFish** dont il est issu (`v1.127.0` →
  `1.127.0`) : un consommateur sait quelle version de l'API correspond à quelle version du contrat.
- Le workflow `.github/workflows/publish-api-contract.yml` lance `:api-contract:test` puis
  `:api-contract:publish` à chaque release GitHub publiée, ou manuellement avec une version.
- En local : `./gradlew :api-contract:publishToMavenLocal -PcontractVersion=0.0.1-local`.
- `ContractDeserializationUTests` vérifie que des payloads JSON représentatifs se désérialisent
  dans les types du contrat avec une configuration Jackson de consommateur.

### Build

- `backend/settings.gradle.kts` inclut `api-contract`.
- La configuration ktlint (version 1.5.0 et blocage de Kotlin 2.1.0 pour ses configurations) est
  passée dans un bloc `allprojects { pluginManager.withPlugin("org.jlleitschuh.gradle.ktlint") }`
  pour s'appliquer aux deux projets.
- Le workflow CI/CD se déclenche aussi sur `backend/settings.gradle.kts` et
  `backend/api-contract/build.gradle.kts`.

## Conséquences

### Positives

- Les consommateurs ne recopient plus les types : un changement de l'API publique arrive chez eux
  comme une montée de version de dépendance, et casse à la compilation plutôt qu'en production.
- Le contrat de l'API publique est délimité et lisible à un seul endroit ; toute modification de
  `backend/api-contract` est un changement d'API, visible comme tel en revue.
- Les DTO ne dépendent plus du domaine : le mapping est explicite et testé
  (`MissionActionDataOutputMappersUTests`, `ContractEnumMapperUTests`).

### Négatives / points d'attention

- **Les enums existent en double** (domaine et contrat). Ajouter une constante au domaine impose de
  l'ajouter au contrat ; le test de parité le rappelle, mais au prix d'une modification de plus.
- **Le partage du type avec la BFF lie le frontend et l'API publique** : un champ ajouté pour le
  frontend dans `MissionActionDataOutput` est aussi publié aux consommateurs externes, et doit
  respecter les règles de compatibilité.
- **GitHub Packages exige un jeton**, même pour lire un package d'un dépôt public. Seul un
  *personal access token (classic)* fonctionne : le registre Maven n'accepte pas les tokens
  *fine-grained*. MonitorFish n'est pas concerné (il dépend de `project(":api-contract")`), mais
  chaque consommateur doit s'organiser :
  - **en local**, chaque développeur crée un token classic limité au scope `read:packages` et le
    range hors du dépôt, dans `~/.gradle/gradle.properties` (`gpr.user`, `gpr.key`). La
    configuration Gradle du consommateur lit ces propriétés, avec `GITHUB_ACTOR` /
    `GITHUB_TOKEN` en repli. C'est une étape d'installation de plus, avec un token lié au compte
    personnel ;
  - **en CI**, soit le `GITHUB_TOKEN` du workflow avec `permissions: packages: read` (le package
    étant rattaché au dépôt `MTES-MCT/monitorfish`, la lecture depuis un autre dépôt est à
    vérifier avant de s'y fier), soit un secret d'organisation contenant un token classic
    `read:packages` d'un compte de service, à renouveler ;
  - **dans un `Dockerfile`**, le token passe en secret de build (`docker build --secret`), jamais
    en argument de build, qui le laisserait dans les couches de l'image.

  Ces procédures sont documentées dans `backend/api-contract/README.md`. Si les consommateurs se
  multiplient, une publication sur **Maven Central** (lecture sans jeton, au prix d'une
  vérification de namespace et d'une signature GPG) supprimerait cette contrainte.
- **Une version publiée par release**, y compris quand le contrat n'a pas changé ; à l'inverse, un
  changement du contrat n'est disponible qu'à la release suivante (ou par publication manuelle).
- La compatibilité ascendante repose sur la discipline et la revue : aucun outil ne compare
  automatiquement le contrat publié à la version précédente.
- L'endpoint `PUT /api/v1/mission_actions/{id}/species_onboard/{speciesIndex}` renvoie
  `PublicMissionActionDataOutput`, mais son corps (`UpdateMissionActionSpeciesOnboardDataInput`)
  n'est pas dans le contrat.
