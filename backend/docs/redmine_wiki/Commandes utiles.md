## Informations générales et organisation

#### Utilisateur
L'utilisateur `mf` est dans le groupe `docker` pour pouvoir manipuler les conteneurs sans nécessiter un `sudo` (cf. [docker sans sudo](https://github.com/sindresorhus/guides/blob/main/docker-without-sudo.md)).

#### Code source
Nous avons besoin de récupérer le mono-repo de l'application disponible sur [github](https://github.com/MTES-MCT/monitorfish) pour disposer du `Makefile`, des fichers de config et du fichier `docker-compose.yml`.
Le code-source de l'application est clonée dans le $HOME de l'utilisateur `mf`: `/home/mf/monitorfish`.
C'est dans les dossier `/home/mf/monitorfish/infra/remote/dev` et respectivement `prod` que les fichiers et scripts relatifs au RUN sont stockés.

#### Logs
On peut suivre les logs de l'application avec `docker logs -f remote_app_1`.
`remote_app_1` est le nom du backend MonitorFish et `remote_db_1` est le nom du la base de donnée, on peut le vérifier avec `docker ps`.

##### Quelques commandes utiles:
- Voir les logs: `docker logs remote_app_1`
- Voir les nouveaux logs: `docker logs -f remote_app_1`
- Voir CPU and mémoire: `docker stats`
- Voir CPU and mémoire pour un conteneur: `docker stats remote_app_1`
- Voir les process d'un conteneur: `docker top remote_app_1`
- Voir les évènements docker: `docker events`
- Voir le stockage docker: `docker system df`

Aujourd'hui, les logs sont écrits dans un ficher json, mais on peut également les envoyer dans un `journald` ou autre ([voir documentation ici](https://docs.docker.com/config/containers/logging/configure/#supported-logging-drivers)). Pour connaître la localisation du fichier de log:
```
$> docker inspect remote_app_1 | grep log
"LogPath": "/var/lib/docker/containers/374abacf2889d6a0a58f9930882aa811db81da40ef7520c861e9d8b1e285943f/374abacf2889d6a0a58f9930882aa811db81da40ef7520c861e9d8b1e285943f-json.log",
```

#### Base de donnée
##### Authent
L'application utilise la variable d'environnement  `ENV_DB_URL` pour connaitre l'URI et les identifiants de la base de donnée.
Exemple: `jdbc:postgresql://db:5432/monitorfishdb?user=postgres&password=postgres`
Cette variable d'environnement est définie avec une valeur par défaut dans le fichier `infra/remote/dev/docker-compose.yml` mais il est possible de surcharger cette variable.

##### Volume
La base de donnée utilise un `volume` docker, on peut voir les volumes existants avec :
```
$> docker volume ls
local               remote_db-data
```

Pour voir où est stocké le volume de la base (ici, `/var/lib/docker/volumes/remote_db-data/_data`) :

```
$> docker volume inspect remote_db-data
[
    {
        "CreatedAt": "2021-02-11T09:03:16+01:00",
        "Driver": "local",
        "Labels": {
            "com.docker.compose.project": "remote",
            "com.docker.compose.volume": "db-data"
        },
        "Mountpoint": "/var/lib/docker/volumes/remote_db-data/_data",
        "Name": "remote_db-data",
        "Options": null,
        "Scope": "local"
    }
]
```

---
## Lancer et arrêter MonitorFish
### Lancement de Monitorfish
Pour lancer le conteneur de l'application et PostgreSQL:

1. **Aller dans le dossier de l'app :**

    `$> cd /home/mf/monitorfish`

2. **Vérifier la version de l'image de l'application** (ici, `v0.0.1_snapshot`) :

    `$> vi infra/remote/dev/docker-compose.yml`

La partie `app.image` du yml référence l'image que nous allons chercher:
 ```
    image: docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:v0.0.1_snapshot
    environment:
      - ENV_DB_URL=jdbc:postgresql://db:5432/monitorfishdb?user=postgres&password=postgres
      - HOST_IP=127.0.0.1
    ports:
      - 8880:8880
      - 8000:8000
      - 5000:5000
    networks:
      - backend
    depends_on:
      - db
    restart: always 
```

3. **Lancer l'application :**

```$> make restart-remote-app```

Cette commande récupère la dernière image de l'application disponible pour le tag défini et met à jour le conteneur si il était déjà lancé.

4. **On peut vérifier que les conteneurs sont bien lancés :**
```
$> docker ps
CONTAINER ID        IMAGE                                                                        COMMAND                  
374abacf2889        docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-app:v0.0.1_snapshot   "/bin/sh -c 'exec ja…"   2 weeks ago         Up 35 minutes       0.0.0.0:5000->5000/tcp, 0.0.0.0:8000->8000/tcp, 0.0.0.0:8880->8880/tcp   remote_app_1
8128b680d7fe        timescale/timescaledb-postgis:1.7.4-pg11                                     "docker-entrypoint.s…"   2 months ago        Up 35 minutes       0.0.0.0:5432->5432/tcp  
```

### Arrêter MonitorFish
1. **Aller dans le dossier du docker-compose :**

    `$> cd /home/mf/monitorfish/infra/remote/dev`
2. **Exécuter la commande docker-compose pour arrêter tous les conteneurs**

    `$> docker-compose stop app`


---

## Aller dans une interface psql de la base de données PostgreSQL

1. **Se connecter dans l'interface bash du conteneur :**

   `$> sudo docker exec -it remote_db_1 bash`
2. **Changer d'utilisateur (avec celui défini - ici par défaut postgres) :**

    `bash-5.0# su - postgres`
3. **Lancer psql avec le bon utilisateur : (il faudra aussi renseigner le mot de passe)**

    `$> psql -U postgres`
4. **Se connecter à la base MonitorFish**

    `$> \c monitorfishdb`
5. **Afficher les tables**

    `$> \dt`
 
 
--- 
## ETL et traitements de données : Prefect

Différents traitements de données sont programmés de façon périodique et ajoutent ou modifient des données dans la base de données Monitorfish:

* des imports  de référentiels (Navpro, Gina, espèces engins...)
* le parsing des messages ERS
* des calculs d'alertes
* ...

Ces traitements sont réalisés avec [Prefect](https://www.prefect.io/), un outil open source.

### Architecture
Les traitements de données dans Monitorfish comportent deux services :

* **monitorfish-pipeline-server** : ce service lance l'orchestrateur Prefect Server qui planifie et ordonne l'exécution des traitements
* **monitorfish-pipeline-flows** : un service chargé d'exécuter les traitements en python (appelés "flows"). 


Prefect Server est constitué de plusieurs services, notamment :

* une API GraphQL avec laquelle le service exécuteur interagit pour prendre ses instructions de traitements à réaliser
* une interface utilisateur web qui permet de visualiser les traitements réalisés et programmés, les échecs, les retrys, de modifier les plannings d'exécution...
* une base de données PostgreSQL qui stocke les méta données sur tous les runs à venir et passés

### Lancer Prefect

Pour lancer Prefect, il faut lancer les 2 composants :

1. lancer **monitorfish-pipeline-server** :

    ```make docker-run-pipeline-server```
    
    Ceci lance tous les services qui constituent Prefect Server (6 au total). Au bout d'environ 30 secondes, les services sont lancés est on voit s'afficher sur la console une inscription "PREFECT SERVER" en ascii art.

2. Une fois Prefect Server lancé, pour que les traitements ordonnés soient réalisés, il faut lancer le service en chage de l'exécution :

   ```make docker-run-pipeline-flows```

### Arrêter Prefect 

* Pour arrêter l'orchestrateur : 

    ```make docker-stop-pipeline-server```.

    Ceci arrête tous les services de Prefect Server.

* Pour arrêter l'exécuteur de tâches :

    ```make docker-stop-pipeline-flows```