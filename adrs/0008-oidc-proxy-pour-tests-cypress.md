# ADR-0008: Configuration OIDC avec proxy pour les tests Cypress

**Date:** 2025-01-14  
**Statut:** Accepté  

## Contexte

Lors de l'implémentation de l'authentification OIDC avec Keycloak dans MonitorFish, nous avons rencontré un problème majeur pour les tests Cypress. Cypress nécessite un accès à une seule URL pour fonctionner correctement, mais notre configuration OIDC implique deux services distincts :

1. **L'application MonitorFish** (backend + frontend) sur `localhost:8880`
2. **Keycloak** sur `localhost:8085`

### Problèmes identifiés

1. **Limitation Cypress** : Cypress ne peut pas naviguer entre différents domaines/ports pendant les tests
2. **Redirection complexe** : Le flux OAuth2 implique plusieurs redirections entre l'application et Keycloak
3. **Actions de formulaire** : Les formulaires de connexion Keycloak génèrent des actions pointant vers l'URL interne du container (`keycloak:8080`) inaccessible depuis le navigateur

## Décision

Nous avons décidé d'implémenter une solution de **proxy** au niveau du backend MonitorFish pour les tests Cypress, permettant d'accéder à Keycloak via l'URL de l'application principale.

### Architecture de la solution

```
Frontend (Cypress) → localhost:8880/realms/* → KeycloakProxyController → keycloak:8080/realms/*
```

## Implémentation

### 1. Configuration Docker Compose Cypress

```yaml
# docker-compose.cypress.yml
environment:
  # Backend utilise l'URL interne pour les appels API
  - MONITORFISH_OIDC_ISSUER_URI=http://keycloak:8080/realms/monitor
  # Frontend utilise l'URL externe pour les redirections
  - MONITORFISH_OIDC_ISSUER_URI_EXTERNAL=http://localhost:8880/realms/monitor
  - MONITORFISH_OIDC_PROXY_URL=http://keycloak:8080
  - MONITORFISH_KEYCLOAK_PROXY_ENABLED=true
  - MONITORFISH_OIDC_REDIRECT_URI=http://localhost:8880/login/oauth2/code/proconnect
```

### 2. Configuration Spring Boot

```yaml
# application.yml
monitorfish:
  oidc:
    proxyUrl: ${MONITORFISH_OIDC_PROXY_URL:}
  keycloak:
    proxy:
      enabled: ${MONITORFISH_KEYCLOAK_PROXY_ENABLED:false}

spring:
  security:
    oauth2:
      client:
        provider:
          proconnect:
            issuer-uri: ${MONITORFISH_OIDC_ISSUER_URI}
            authorization-uri: ${MONITORFISH_OIDC_ISSUER_URI_EXTERNAL}/protocol/openid-connect/auth
            token-uri: ${MONITORFISH_OIDC_ISSUER_URI}/protocol/openid-connect/token
            user-info-uri: ${MONITORFISH_OIDC_ISSUER_URI}/protocol/openid-connect/userinfo
            jwk-set-uri: ${MONITORFISH_OIDC_ISSUER_URI}/protocol/openid-connect/certs
```

### 3. KeycloakProxyController

Le contrôleur proxy gère :
- **Proxy des requêtes GET/POST** vers Keycloak interne
- **Réécriture des réponses HTML** pour corriger les URLs des formulaires

Fonctionnalités clés :
```kotlin
@RestController
@ConditionalOnProperty(
    value = ["monitorfish.keycloak.proxy.enabled"],
    havingValue = "true",
    matchIfMissing = false
)
class KeycloakProxyController {
    
    @GetMapping("/realms/**")
    fun get(proxy: ProxyExchange<ByteArray?>, request: HttpServletRequest): ResponseEntity<*> {
        val response = proxy.uri("${oidcProperties.proxyUrl}${request.requestURI}").get()
        return if (isHtmlResponse(response)) {
            rewriteHtmlResponse(response) // Réécrit les URLs internes
        } else {
            response
        }
    }
    
    private fun rewriteHtmlResponse(response: ResponseEntity<*>): ResponseEntity<*> {
        // Remplace les URLs internes par des URLs externes
        val rewrittenHtml = html
            .replace("http://keycloak:8080", "http://localhost:8880")
            .replace("action=\"/realms/", "action=\"http://localhost:8880/realms/")
            .replace("href=\"/realms/", "href=\"http://localhost:8880/realms/")
            .replace("src=\"/realms/", "src=\"http://localhost:8880/realms/")
    }
}
```

### 4. Configuration Keycloak

```yaml
# docker-compose.cypress.yml
keycloak:
  environment:
    - KC_HOSTNAME=keycloak:8080  # Hostname interne
    - KC_FRONTEND_URL=http://localhost:8880/  # URL externe pour les redirections
    - KC_PROXY=edge
    - KC_PROXY_HEADERS=forwarded
```

## Flux d'authentification

### 1. Développement local
```
Frontend → localhost:3000
Backend → localhost:8880
Keycloak → localhost:8085 (accès direct)
Proxy → DÉSACTIVÉ
```

### 2. Tests Cypress
```
Frontend → localhost:8880
Backend → localhost:8880
Keycloak → localhost:8880/realms/* (via proxy)
Proxy → ACTIVÉ
```

## Avantages

1. **Transparence** : Aucune modification nécessaire dans les tests Cypress
2. **Flexibilité** : Configuration différente selon l'environnement (dev vs test)

## Inconvénients

1. **Complexité** : Configuration plus complexe avec deux environnements distincts
2. **Maintenance** : Nécessite de maintenir le code du proxy (utilisé seulement pour le développement)
3. **Debugging** : Plus difficile de déboguer les problèmes d'authentification

## Alternatives considérées

### Alternative 2 : Modifier Keycloak pour utiliser une seule URL
**Rejetée** : Impossible de faire fonctionner les communications backend-to-Keycloak

### Alternative 3 : Configurer Cypress pour accepter plusieurs domaines
**Rejetée** : Limitation technique de Cypress, pas de solution robuste

## Impact

- **Tests Cypress** : Fonctionnement transparent avec authentification OIDC
- **Développement local** : Aucun impact, configuration séparée
- **Production** : Aucun impact, proxy désactivé en production
- **Maintenance** : Ajout d'un composant à maintenir

## Validation

La solution a été validée avec :
- Tests d'authentification complets en local
- Tests Cypress fonctionnels
- Vérification de la non-régression en développement local

