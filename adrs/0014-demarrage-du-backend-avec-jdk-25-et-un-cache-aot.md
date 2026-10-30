# ADR-0014: Démarrage du backend avec JDK 25 et un cache AOT

**Date:** 2026-10-30
**Statut:** Accepté

## Contexte

En production, le backend tourne dans un seul conteneur (`infra/remote/docker-compose.yml`),
derrière un Apache qui lui transmet les requêtes en AJP. Un redémarrage
(`make restart-remote-app`) recrée ce conteneur : **l'application est inaccessible le temps que la
JVM démarre, environ 60 secondes.**

Le temps de démarrage n'est pas dû à un appel réseau lent : la configuration OIDC (Cerbère) est
statique, la connexion Kafka est asynchrone, et Flyway valide les 446 migrations en 0,65 s. Il est
réparti entre le travail de Spring (lecture de la configuration, conditions, création des beans),
la construction du modèle Hibernate et la validation du schéma (`ddl-auto: validate`), la création
des 48 repositories Spring Data (parsing JPQL, réflexion Kotlin) et Spring Security. Une large part
est le **chargement des classes** : la JVM recherche, lit, vérifie et lie à chaque démarrage les
dizaines de milliers de classes de Spring, Hibernate, Tomcat, Kafka…, avec un résultat toujours
identique.

Le démarrage tournait en JDK 21, depuis le jar Spring Boot « imbriqué » (`java -jar` sur un jar
contenant d'autres jars), sans optimisation de la JVM.

## Décision

### JDK 25 et cache AOT

Le backend passe en **JDK 25** (toolchain Gradle, images Docker, CI) et l'image applicative
embarque un **cache AOT** (*ahead-of-time*, JEP 483, 514 et 515) :

1. **Le jar est extrait** au build de l'image (`java -Djarmode=tools … extract`) : le cache AOT
   exige un classpath simple, sans jars imbriqués.
2. **Un démarrage d'entraînement** (`-XX:AOTCacheOutput=app/app.aot`) lance l'application au build
   de l'image ; `-Dspring.context.exit=onRefresh` l'arrête dès que les beans sont créés. La JVM
   enregistre alors dans `app/app.aot` les classes chargées et liées, ainsi que les profils
   d'exécution des méthodes.
3. **Au démarrage réel**, `-XX:AOTCache=app/app.aot` (dans `infra/docker/app/start.sh`) recharge
   ce travail au lieu de le refaire.

Le cache ne contient que du **code** (des classes), jamais de données ni de configuration. Aucune
base ni Kafka n'étant accessibles au build, l'entraînement utilise des valeurs factices
(`infra/docker/app/aot-training.env`) et désactive Flyway et la validation du schéma Hibernate
**pour ce seul démarrage**. En production, l'application lit son environnement réel et valide
toujours le schéma et les migrations.

`api-contract` est compilé avec le JDK 25 mais reste en bytecode et API Java 21 (`release 21`)
pour ses consommateurs (RapportNav).

### Un cache inutilisable fait échouer le build

**La JVM ignore silencieusement un cache qui ne correspond pas exactement** à ses options de
démarrage : même JDK, mêmes jars, mêmes modules. Elle démarre alors normalement, sans gain, avec
seulement une ligne `[error][aot]` dans les logs. C'est arrivé lors de la mise en place : les
options JMX de `JAVA_TOOL_OPTIONS` chargent le module `jdk.management.agent` au démarrage réel,
mais pas à l'entraînement.

Deux mesures :

- l'entraînement ajoute `--add-modules jdk.management.agent` ;
- dans le même `RUN`, l'image redémarre le contexte avec les options réelles (`JAVA_TOOL_OPTIONS`
  compris) et `-XX:AOTMode=on`, qui **arrête la JVM si le cache ne peut pas être chargé** : le
  build de l'image échoue au lieu de produire une image sans gain.

### spring-boot-devtools en `developmentOnly`

`spring-boot-devtools` était déclaré en `runtimeOnly`, donc embarqué dans le jar de production. Il
restait inactif tant que l'application démarrait depuis le jar imbriqué, mais **s'active avec le
jar extrait** (thread `restartedMain`, rechargement à chaud en production). Il passe en
`developmentOnly` : `bootRun` (`make run-back`) le garde, `bootJar` l'exclut.

### Tenir `aot-training.env` à jour

Une variable d'environnement ajoutée au backend ne se reporte pas d'elle-même dans
`aot-training.env`. Selon son usage, son absence a trois effets :

| Variable absente du fichier | Effet | Détection |
|---|---|---|
| Requise au démarrage (port, booléen, `@Value` sans défaut…) | Le contexte ne démarre pas : l'entraînement échoue | `AotTrainingEnvUTests`, puis le build de l'image |
| Lue comme texte (`@ConfigurationProperties`, ex. `MONITORENV_URL`) | Aucun : la valeur n'est pas dans le cache | `AotTrainingEnvUTests` |
| Interrupteur de fonctionnalité laissé à `false` | Les classes de la fonctionnalité ne sont pas en cache : gain moindre, pas d'erreur | Revue |

`AotTrainingEnvUTests` (tests unitaires backend) vérifie que **toute variable `${VAR}` sans valeur
par défaut de `application.yml` est définie dans `aot-training.env`**, et donne la liste des
variables manquantes. Il échoue dès les tests unitaires, avec un message explicite, au lieu d'une
erreur au milieu des logs Docker.

Règles pour une nouvelle variable :

1. **Sans valeur par défaut** dans `application.yml` : l'ajouter à `aot-training.env` avec une
   valeur factice du bon type (le test l'impose).
2. **Interrupteur activé en production** (`MONITORFISH_…_ENABLED`) : l'ajouter à `true`, pour que
   l'entraînement charge les classes de la fonctionnalité. Le bean ne doit faire aucun appel réseau
   à sa création, le build n'ayant accès à rien.
3. Les variables posées par l'image (`ENV` du `Dockerfile`, comme `STATIC_FILES_PATH`) n'y vont
   pas.

### Mesures

En local, sur la stack `docker-compose.cypress.yml` avec un broker Kafka SSL, temps jusqu'à
l'application disponible (healthcheck), 3 démarrages :

| Image | Disponible | `Started … in` |
|---|---|---|
| v1.128.2 (JDK 21, jar imbriqué) | 23,5 / 22,5 / 22,2 s | ~21 s |
| JDK 25 + jar extrait, cache ignoré | ~18 s | — |
| JDK 25 + cache AOT | 12,1 / 11,9 / 12,6 s | ~11 s |

Le gain se reporte en proportion sur la production, dont la machine est plus lente.

## Alternatives écartées

- **Déploiement bleu/vert** (nouveau conteneur démarré pendant que l'ancien sert) : supprime
  l'indisponibilité, mais demande de modifier l'Apache de production et le déploiement.
- **Désactiver `ddl-auto: validate` ou la validation Flyway** en production : gain faible (0,65 s
  pour Flyway) contre la perte d'une garantie de cohérence entre entités et schéma.
- **CDS (*class data sharing*) en JDK 21** : ne met en cache que le chargement des classes, sans
  liaison ni profils ; gain inférieur au cache AOT de JDK 25.
- **Spring AOT** (`processAot`, configuration des beans précalculée au build) : fige au build les
  `@ConditionalOnProperty` (OIDC, Kafka, proxy Keycloak), alors qu'une même image sert la
  production et les stacks de test avec des valeurs différentes.
- **`spring.main.lazy-initialization`** : reporte la création des beans sur les premières requêtes
  des utilisateurs.
- **Bootstrap JPA `DEFERRED`** (Hibernate construit en arrière-plan) : mesuré sans gain
  (13,6 s contre 13,2 s en moyenne sur 5 démarrages), le thread principal attendant Hibernate.

## Conséquences

### Positives

- Le temps d'indisponibilité au redémarrage est divisé par deux environ, sans changement
  d'infrastructure ni de comportement de l'application.
- Un cache inutilisable fait échouer le build de l'image, et une variable manquante dans
  `aot-training.env` fait échouer les tests unitaires.
- devtools n'est plus embarqué dans le jar de production.

### Négatives / points d'attention

- **L'image grossit d'environ 170 Mo** (le cache) et son build d'environ 40 s (entraînement et
  vérification).
- **Le cache dépend des options de démarrage.** Tout changement d'options JVM, de module ou
  d'image de base doit garder l'entraînement et le démarrage alignés ; le build le vérifie.
- **La vérification au build ne couvre pas l'environnement de production.** Au-delà de 32 Go de
  heap (heap maximal par défaut = ¼ de la RAM, donc une machine de plus de ~128 Go), la JVM
  change de format de pointeurs et ignore le cache. Après un déploiement :
  `docker logs monitorfish_backend | grep '\[error\]\[aot\]'` ne doit rien afficher ; sinon,
  fixer `-Xmx`.
- **Montée de version du JDK.** En JDK 25, le cache ne contient pas de code natif
  (`AOTAdapterCaching` et `AOTStubCaching` désactivés), donc pas de risque lié au CPU. Les versions
  suivantes y stockent du code compilé pour le CPU de la machine de build : un CPU de production
  différent peut alors provoquer un crash `SIGILL` ou ignorer le cache
  ([retour d'expérience XPipe](https://xpipe.io/blog/java-aot-cache)). À vérifier avant de
  passer en JDK 26+.
- **L'entraînement est partiel** : il s'arrête à la création des beans, sans base. Les classes
  utilisées uniquement en production (migrations Flyway, connexion Kafka, premières requêtes) se
  chargent normalement.
- **Le temps de démarrage reste lié au CPU** : la JVM compile en parallèle au démarrage, une
  machine avec peu de cœurs ou chargée démarre plus lentement.
