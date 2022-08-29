# Exploitation de l'orchestrateur Prefect Server

## Configuration
- Le fichier de configuration `config.toml` doit être complété et placé dans `~/.prefect` en indiquant l'URL à laquelle le service est disponible. Ceci sert à indiquer à l'UI à quelle URL faire les requêtes graphql.
- Prefect doit être configuré pour tourner en mode `server` et non en mode `cloud`. Ceci est visible au fichier `~/.prefect/backend.toml` - si celui n'est pas présent ou indique `backend = "cloud"`, exécuter `prefect back server` pour basculer en mode `server`.
- Config réseau :
  - Redirection de `/` vers le port 80
  - Redirection de `/graphql` vers le port 4200

## Démarrage et arrêt du service
L'interaction avec Prefect Server se fait via l'interface en ligne de commande fournie par la librairie python Prefect. Pour pouvoir l'utiliser, il faut activer l'environnement virtuel dans lequel cette librarie est installée :

```bash
source venv/bin/activate
```

Une fois l'environnement activé, les commandes sont :
- pour le démarrage :

```bash
prefect server start -d --use-volume --volume-path /var/log/prefect/server/pg_data --expose --no-postgres-port --no-graphql-port --no-hasura-port &
```
- pour l'arrêt
```bash
prefect server stop
```

Pour voir les services lancés, utiliser `docker ps`.

## Nettoyage des logs
Prefect Server comporte une base de données Postgresql qui stocke tous les logs et les états (succès, échec, dates d'exécution...) des tâches exécutées. Pour éviter que cette base ne devienne trop lourde, il est conseillé de nettoyer les logs en mettant en place un CRON quotidien de suppression des logs de plus de X jours.

Pour cela, créer un crontab exécutant le script `truncate-prefect-logs.sh`.