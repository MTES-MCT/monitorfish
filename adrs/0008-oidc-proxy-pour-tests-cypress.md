# ADR-0008: Configuration OIDC avec proxy Keycloak pour développement local et tests Cypress

**Date:** 2025-01-14
**Dernière mise à jour:** 2025-10-07
**Statut:** Accepté

## Contexte

Lors de l'implémentation de l'authentification OIDC avec Keycloak dans MonitorFish, nous avons rencontré des problèmes majeurs pour le développement local et les tests Cypress :

1. **L'application MonitorFish** - Backend sur `localhost:8880`, Frontend sur `localhost:3000`
2. **Keycloak** - Container Docker exposé sur `localhost:8085`

### Problèmes identifiés

1. **URLs internes Docker** : Les formulaires de connexion Keycloak génèrent des actions pointant vers l'URL interne du container (`http://keycloak:8080`) inaccessible depuis le navigateur
2. **Issuer JWT** : Les tokens JWT générés par Keycloak contiennent `iss: http://keycloak:8080/realms/monitor` qui ne correspond pas aux URLs accessibles depuis l'extérieur
3. **Limitation Cypress** : Cypress ne peut pas naviguer entre différents domaines/ports pendant les tests
4. **Redirection complexe** : Le flux OAuth2 implique plusieurs redirections entre l'application et Keycloak

## Décision

Nous avons décidé d'implémenter une solution de **proxy** au niveau du backend MonitorFish pour le développement local et les tests Cypress, permettant d'accéder à Keycloak via l'URL du backend (`localhost:8880`) et de réécrire les URLs internes Docker.

### Architecture de la solution

```
Navigateur → localhost:8880/realms/* → KeycloakProxyController → localhost:8085 (Docker Keycloak)
                                      ↓
                            Réécriture des URLs HTML
                     (keycloak:8080 → localhost:8880)
```

## Implémentation

### 1. Configuration développement local

```bash
# .env.local.defaults
# Backend server-side calls go directly to Keycloak
MONITORFISH_OIDC_ISSUER_URI=http://localhost:8085/realms/monitor
# Browser-facing authorization URL uses backend proxy (rewrites Keycloak URLs)
MONITORFISH_OIDC_AUTHORIZATION_URI=http://localhost:8880/realms/monitor/protocol/openid-connect/auth
# Server-side token exchange goes directly to Keycloak
MONITORFISH_OIDC_TOKEN_URI=http://localhost:8085/realms/monitor/protocol/openid-connect/token
MONITORFISH_OIDC_USER_INFO_URI=http://localhost:8085/realms/monitor/protocol/openid-connect/userinfo
MONITORFISH_OIDC_JWK_SET_URI=http://localhost:8085/realms/monitor/protocol/openid-connect/certs
# External issuer for JWT validation (tokens from Docker Keycloak have this issuer)
MONITORFISH_OIDC_ISSUER_URI_EXTERNAL=http://keycloak:8080/realms/monitor
# Proxy configuration
MONITORFISH_OIDC_PROXY_URL=http://localhost:8085
MONITORFISH_KEYCLOAK_PROXY_ENABLED=true
```

### 1bis. Configuration Docker Compose Cypress

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

### 1. Développement local (make run-back / make run-front)
```
Frontend (Vite) → localhost:3000
   ↓ Proxies: /api, /bff, /logout, /oauth2 → localhost:8880
Backend → localhost:8880
   ↓ OIDC Authorization: localhost:8880/realms/* → KeycloakProxyController
   ↓ Token/UserInfo/JWK: localhost:8085/realms/* (direct)
Keycloak (Docker) → localhost:8085
Proxy → ACTIVÉ (MONITORFISH_KEYCLOAK_PROXY_ENABLED=true)

Configuration clé:
- MONITORFISH_OIDC_AUTHORIZATION_URI=http://localhost:8880/realms/monitor/... (via proxy)
- MONITORFISH_OIDC_TOKEN_URI=http://localhost:8085/realms/monitor/... (direct)
- MONITORFISH_OIDC_ISSUER_URI=http://localhost:8085/realms/monitor (pour API calls)
- MONITORFISH_OIDC_ISSUER_URI_EXTERNAL=http://keycloak:8080/realms/monitor (pour validation JWT)
```

### 2. Tests Cypress (docker-compose.cypress.yml)
```
Frontend → localhost:8880 (dans Docker)
Backend → localhost:8880 (dans Docker)
   ↓ Tous les endpoints OIDC → app:8880/realms/* (via proxy)
Keycloak → keycloak:8080 (réseau Docker)
Proxy → ACTIVÉ (MONITORFISH_KEYCLOAK_PROXY_ENABLED=true)

Configuration clé:
- Tous les endpoints OIDC pointent vers app:8880 (via proxy interne Docker)
- MONITORFISH_OIDC_ISSUER_URI=http://keycloak:8080/realms/monitor
- MONITORFISH_OIDC_ISSUER_URI_EXTERNAL=http://localhost:8880/realms/monitor
```

### 3. Production
```
Backend → URL ProConnect publique
Keycloak → N/A (utilise ProConnect officiel)
Proxy → DÉSACTIVÉ (MONITORFISH_KEYCLOAK_PROXY_ENABLED non défini)
```

## Avantages

1. **URLs cohérentes** : Le navigateur n'a besoin que de `localhost:8880` pour toute l'authentification
2. **Réécriture automatique** : Les URLs internes Docker sont automatiquement réécrites pour le navigateur
3. **Transparence Cypress** : Aucune modification nécessaire dans les tests
4. **Flexibilité** : Configuration adaptée à chaque environnement (dev local, Cypress, production)
5. **Issuer multiple** : Validation JWT acceptant à la fois l'issuer interne Docker et l'issuer externe

## Inconvénients

1. **Complexité** : Configuration OIDC avec multiples URLs selon le contexte (authorization vs token vs validation)
2. **Maintenance** : Code proxy supplémentaire à maintenir (dev/test uniquement)
3. **Debugging** : Plus difficile de tracer les requêtes à travers le proxy

## Alternatives considérées

### Alternative 2 : Modifier Keycloak pour utiliser une seule URL
**Rejetée** : Impossible de faire fonctionner les communications backend-to-Keycloak

### Alternative 3 : Configurer Cypress pour accepter plusieurs domaines
**Rejetée** : Limitation technique de Cypress, pas de solution robuste

## Impact

- **Développement local** : Authentification OIDC fonctionnelle avec Keycloak Docker
- **Tests Cypress** : Fonctionnement transparent avec authentification OIDC
- **Production** : Aucun impact, proxy désactivé et code non chargé
- **Maintenance** : Ajout d'un composant à maintenir pour dev/test
- **Frontend Vite** : Proxy `/realms` et `/resources` supprimé, tout passe par le backend

## Validation

La solution a été validée avec :
- Tests d'authentification complets en local
- Tests Cypress fonctionnels
- Vérification de la non-régression en développement local

## Configuration développement local (2025-10-07)

### Problème initial
Lors du développement local avec `make run-back` et `make run-front`, l'authentification ne fonctionnait pas car :
1. Le frontend Vite (localhost:3000) proxiait `/realms` directement vers Keycloak (localhost:8085)
2. Keycloak retournait des URLs de formulaire avec le hostname interne Docker (`http://keycloak:8080`)
3. Le navigateur ne pouvait pas accéder à ces URLs internes

### Solution finale
**Supprimer le proxy Vite** et tout router via le backend proxy :

```typescript
// vite.config.ts - Proxy Keycloak SUPPRIMÉ
server: {
  proxy: {
    '/api': { target: 'http://localhost:8880' },
    '/bff': { target: 'http://localhost:8880' },
    '/oauth2': { target: 'http://localhost:8880' },
    // ❌ SUPPRIMÉ: '/realms' et '/resources'
  }
}
```

**Configuration backend pour dev local** (`.env.local.defaults`) :

```bash
# Backend server-side calls go directly to Keycloak
MONITORFISH_OIDC_ISSUER_URI=http://localhost:8085/realms/monitor

# Browser-facing authorization URL uses backend proxy (rewrites Keycloak URLs)
MONITORFISH_OIDC_AUTHORIZATION_URI=http://localhost:8880/realms/monitor/protocol/openid-connect/auth

# Server-side token exchange goes directly to Keycloak
MONITORFISH_OIDC_TOKEN_URI=http://localhost:8085/realms/monitor/protocol/openid-connect/token
MONITORFISH_OIDC_USER_INFO_URI=http://localhost:8085/realms/monitor/protocol/openid-connect/userinfo
MONITORFISH_OIDC_JWK_SET_URI=http://localhost:8085/realms/monitor/protocol/openid-connect/certs

# External issuer for JWT validation (tokens from Docker Keycloak have this issuer)
MONITORFISH_OIDC_ISSUER_URI_EXTERNAL=http://keycloak:8080/realms/monitor

# Proxy configuration
MONITORFISH_OIDC_PROXY_URL=http://localhost:8085
MONITORFISH_KEYCLOAK_PROXY_ENABLED=true
```

### Flux d'authentification local

1. **Redirection initiale** : `localhost:3000` (Vite) → `localhost:8880/oauth2/authorization/proconnect`
2. **Authorization** : Backend redirige vers `localhost:8880/realms/monitor/...`
3. **Proxy** : `KeycloakProxyController` forward vers Keycloak et réécrit les URLs HTML
4. **Login form** : Soumis à `localhost:8880/realms/...` (pas `keycloak:8080`)
5. **Token exchange** : Backend appelle directement `localhost:8085/realms/...`
6. **JWT validation** : Accepte issuer `http://keycloak:8080/realms/monitor`

### Points clés
- ✅ Authorization URL via proxy (`localhost:8880`) pour réécriture HTML
- ✅ Token/UserInfo/JWK en direct (`localhost:8085`) pour performance
- ✅ Validation JWT accepte l'issuer interne Docker (`keycloak:8080`)
- ✅ Pas de proxy Vite nécessaire, tout passe par le backend

## Mise à jour pour Spring Boot 3.4 (2025-10-06)

Lors de la migration vers Spring Boot 3.4.1 et Spring Cloud Gateway MVC 4.2.1, plusieurs problèmes critiques ont été identifiés et résolus :

### Problème 1 : Headers HTTP en lecture seule

**Erreur:** `UnsupportedOperationException` lors de la tentative de suppression du header CORS
```
java.lang.UnsupportedOperationException
	at org.springframework.http.ReadOnlyHttpHeaders.remove(ReadOnlyHttpHeaders.java:142)
```

**Cause:** Dans Spring Boot 3.4+, les headers de réponse sont maintenant immuables (`ReadOnlyHttpHeaders`)

**Solution:** Créer une nouvelle `ResponseEntity` avec des headers filtrés au lieu de modifier les headers existants
```kotlin
private fun removeCorsHeader(response: ResponseEntity<*>): ResponseEntity<*> {
    val newHeaders = response.headers.toMutableMap()
    newHeaders.remove("Access-Control-Allow-Origin")

    return ResponseEntity
        .status(response.statusCode)
        .headers { headers ->
            newHeaders.forEach { (key, values) ->
                headers.addAll(key, values)
            }
        }
        .body(response.body)
}
```

### Problème 2 : RestTemplate suivant les redirections automatiquement

**Erreur:** HTTP 404 après authentification réussie, la redirection OAuth2 était suivie côté serveur

**Cause:** `RestTemplate` suivait automatiquement les redirections HTTP 302, empêchant le navigateur de gérer le flux OAuth2

**Solution:** Désactiver le suivi automatique des redirections dans `RestTemplateConfig`
```kotlin
val requestFactory = object : SimpleClientHttpRequestFactory() {
    override fun prepareConnection(connection: HttpURLConnection, httpMethod: String) {
        super.prepareConnection(connection, httpMethod)
        connection.instanceFollowRedirects = false
    }
}
```

### Problème 3 : Validation de l'issuer JWT

**Erreur:** `OAuth2AuthenticationException: invalid_id_token` - L'issuer du JWT ne correspond pas
```
The ID Token contains invalid claims: {iss=http://localhost:8880/realms/monitor}
```

**Cause:**
- Les tokens JWT contiennent `iss=http://localhost:8880/realms/monitor` (issuer externe via le proxy)
- Le backend est configuré avec `issuerUri=http://keycloak:8080/realms/monitor` (issuer interne)
- Spring Security rejette les tokens car l'issuer ne correspond pas

**Solution:** Ajout d'un `JwtDecoderFactory` personnalisé acceptant les deux issuers en mode développement
```kotlin
@Bean
fun jwtDecoderFactory(): JwtDecoderFactory<ClientRegistration> {
    val issuerUri = oidcProperties.issuerUri
    val externalIssuer = oidcProperties.issuerUriExternal

    return JwtDecoderFactory { clientRegistration ->
        val jwtDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build()

        // DEV ONLY: Accept both internal and external issuers
        if (!externalIssuer.isNullOrBlank()) {
            val issuerValidator = OAuth2TokenValidator<Jwt> { jwt ->
                if (jwt.issuer == issuerUri || jwt.issuer == externalIssuer) {
                    success()
                } else {
                    failure("Invalid issuer")
                }
            }
            jwtDecoder.setJwtValidator(DelegatingOAuth2TokenValidator(
                JwtValidators.createDefault(),
                issuerValidator
            ))
        } else {
            // Production: standard validation
            jwtDecoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuerUri))
        }

        jwtDecoder
    }
}
```

**Configuration requise:**
```yaml
# docker-compose.cypress.yml
environment:
  - MONITORFISH_OIDC_ISSUER_URI=http://keycloak:8080/realms/monitor
  - MONITORFISH_OIDC_ISSUER_URI_EXTERNAL=http://localhost:8880/realms/monitor
```

### Problème 4 : UserInfo endpoint retournant 401

**Erreur:** `invalid_user_info_response - 401 Unauthorized`

**Cause:** Keycloak était configuré avec `KC_PROXY=edge` et utilisait les headers forwarded pour déterminer l'issuer, causant une incompatibilité entre les tokens et la validation

**Solution:** Configurer Keycloak avec un hostname fixe interne
```yaml
# docker-compose.cypress.yml
keycloak:
  environment:
    - KC_HOSTNAME=keycloak
    - KC_HOSTNAME_PORT=8080
    # Removed: KC_PROXY=edge, KC_PROXY_HEADERS=forwarded
```

### Problème 5 : Appels backend aux endpoints OIDC

**Configuration finale:** Le backend appelle tous les endpoints OIDC via le proxy en utilisant `http://app:8880`
```yaml
- MONITORFISH_OIDC_TOKEN_URI=http://app:8880/realms/monitor/protocol/openid-connect/token
- MONITORFISH_OIDC_USER_INFO_URI=http://app:8880/realms/monitor/protocol/openid-connect/userinfo
- MONITORFISH_OIDC_JWK_SET_URI=http://app:8880/realms/monitor/protocol/openid-connect/certs
```

**Flux:** `backend -> localhost:8880 (proxy) -> keycloak:8080 (container)`

Cela évite les problèmes de validation de tokens car les tokens sont toujours validés de manière cohérente.

### Sécurité en production

Tous les composants liés au proxy sont marqués `⚠️ DEVELOPMENT ONLY` et protégés par des annotations conditionnelles :

```kotlin
@ConditionalOnProperty(
    value = ["monitorfish.keycloak.proxy.enabled"],
    havingValue = "true",
    matchIfMissing = false
)
```

En production, `monitorfish.keycloak.proxy.enabled` n'est pas défini, donc :
- ✅ `KeycloakProxyController` n'est PAS chargé
- ✅ `RestTemplateConfig` n'est PAS chargé
- ✅ Validation JWT standard (un seul issuer)
- ✅ Pas de surcharge de performance

