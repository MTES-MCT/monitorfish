# Injection au runtime des variable d'env dans le frontend

Date: 22/11/2023

## Statut

En cours

## Contexte

Lors du passage de `CRA` à `Vite`, on a perdu la possibilité d'injecter des variables d'environnements au frontend au runtime. 

Pour respecter les 12-factor app et avoir plus d'agilité dans la gestion des variables d'env, nous allons rajouter cette feature.

Trois options :
1. Utiliser `import-meta-env` qui injecte dans l'`ENTRYPOINT` docker du backend les variables
2. Ajouter un controlleur `Index` dans le backend, qui retourne le contenu de `index.html` lans lequel il injecte des balises `meta` qui contiennent les variables
3. Utiliser le script `env.sh`, qui injecte dans l'`ENTRYPOINT` docker du backend les variables dans le frontend avec le CLI `sed`

### Utiliser `import-meta-env`

Cette méthode utilise un fichier `.env.template` qui défini les variables à injecter dynamiquement et gére le développement `compile-time` et la production `runtime`.

Un fichier `.env.example` permet de filtrer les variables à injecter dans le frontend.

Il faut rajouter dans l'image docker finale le script `import-meta-env` (préalablement packagé avec `npx pkg`) pour effectuer l'injection dans le fichier `index.html`.

Cette méthode nécessite de rajouter une nouvelle lib dans notre étape de build.

### Ajouter un controlleur `Index` dans le backend

Cette méthode demande:
- D'ajouter les balises `meta` dans le payload retourné sur `/`. (i.e `<meta name="MAPBOX_KEY" content="${System.getenv("MAPBOX_KEY")}" />`)
- De rendre les nom d'assets déterministes (i.e `/assets/index.js`)
  - Cela nous oblige à avoir la gestion du cache dans ce controlleur, avec par exemple un `hash=randomString` généré au démarrage
- L'objet JS généré à la volée avec les balises `meta` ne sera pas typé
- Il faut modifier l'env de dev pour avoir 
  - un build `Vite` "watché" au lieu d'un run de dev watché par défaut
  - un `.setCacheControl()` dans le backend pour éviter le caching en dev

### Utiliser le script `env.sh`

Ce script utilise un object `env` pour stocker les variables (i.e):
```
self.env = {
  REACT_APP_MONITORENV_URL: '__REACT_APP_MONITORENV_URL__'
}
```

Et un script au démarrage de l'image docker avec `ENTRYPOINT ["/home/monitorfish/env.sh"]` (i.e):
```
sed -i 's#__REACT_APP_MONITORENV_URL__#'"$REACT_APP_MONITORENV_URL"'#g' /home/monitorfish/public/env.js
```

- Cette méthode construit un objet `env` non-typé

## Décision



## Conséquences
