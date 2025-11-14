# ADR-0008: Configuration OIDC avec proxy Keycloak pour développement local et tests Cypress

**Date:** 2025-01-14
**Dernière mise à jour:** 2025-11-12
**Statut:** Accepté

## Contexte

Deux problèmes majeurs lors du développement local avec Cypress :

1. **Cypress ne supporte pas les changements d'origine** : Navigation entre localhost:3000 (frontend) et localhost:8880 (backend) provoque des erreurs
2. **Keycloak retourne des URLs internes Docker** : Les formulaires contiennent `http://keycloak:8080` au lieu de `http://localhost:3000` ou `http://localhost:8880`

**Résultat:** Les tests Cypress échouaient en dev mode

## Décision

Implémenter un **proxy Keycloak au niveau du backend** qui :
1. Intercepte les requêtes `/realms/*`
2. Les forward à Keycloak (Docker)
3. Réécrit les URLs HTML pour utiliser l'origine correcte (localhost:3000 ou localhost:8880)
4. Permet à Cypress de rester sur la même origine pendant l'authentification

**Résultat:** Cypress peut maintenant exécuter les tests de login en dev mode sans erreur d'origine

## Implémentation

### 1. Configuration développement local

**.env.local.defaults:**

```bash
# URLs du frontend (localhost:3000)
MONITORFISH_OIDC_SUCCESS_URL=http://localhost:3000
MONITORFISH_OIDC_REDIRECT_URI=http://localhost:3000/login/oauth2/code/proconnect
MONITORFISH_OIDC_AUTHORIZATION_URI=http://localhost:3000/realms/monitor/protocol/openid-connect/auth

# Appels backend vers Keycloak (Docker sur localhost:8085)
MONITORFISH_OIDC_ISSUER_URI=http://localhost:8085/realms/monitor
MONITORFISH_OIDC_TOKEN_URI=http://localhost:8085/realms/monitor/protocol/openid-connect/token
MONITORFISH_OIDC_USER_INFO_URI=http://localhost:8085/realms/monitor/protocol/openid-connect/userinfo
MONITORFISH_OIDC_JWK_SET_URI=http://localhost:8085/realms/monitor/protocol/openid-connect/certs

# Issuer Docker pour validation JWT
MONITORFISH_OIDC_ISSUER_URI_EXTERNAL=http://keycloak:8080/realms/monitor

# Active le proxy Keycloak
MONITORFISH_OIDC_PROXY_URL=http://localhost:8085
MONITORFISH_KEYCLOAK_PROXY_ENABLED=true
```

Le `KeycloakProxyController` adapte automatiquement les URLs retournées par Keycloak à l'origine du navigateur.

### 1bis. Configuration CI (Docker Compose)

**docker-compose.cypress.yml:**

```yaml
environment:
  # URLs du frontend (localhost:8880 dans Docker)
  - MONITORFISH_OIDC_SUCCESS_URL=http://localhost:8880
  - MONITORFISH_OIDC_REDIRECT_URI=http://localhost:8880/login/oauth2/code/proconnect
  - MONITORFISH_OIDC_AUTHORIZATION_URI=http://localhost:8880/realms/monitor/protocol/openid-connect/auth

  # Appels backend vers Keycloak (réseau Docker)
  - MONITORFISH_OIDC_ISSUER_URI=http://keycloak:8080/realms/monitor
  - MONITORFISH_OIDC_TOKEN_URI=http://app:8880/realms/monitor/protocol/openid-connect/token
  - MONITORFISH_OIDC_USER_INFO_URI=http://app:8880/realms/monitor/protocol/openid-connect/userinfo
  - MONITORFISH_OIDC_JWK_SET_URI=http://app:8880/realms/monitor/protocol/openid-connect/certs

  # Proxy
  - MONITORFISH_OIDC_ISSUER_URI_EXTERNAL=http://localhost:8880/realms/monitor
  - MONITORFISH_OIDC_PROXY_URL=http://keycloak:8080
  - MONITORFISH_KEYCLOAK_PROXY_ENABLED=true
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

Le contrôleur proxy intercepte `/realms/**` et :
1. Forward la requête à Keycloak
2. Récupère la réponse HTML
3. Réécrit les URLs Docker (`keycloak:8080`) vers l'origine correcte (localhost:3000 ou 8880)

```kotlin
@RestController
@ConditionalOnProperty(value = ["monitorfish.keycloak.proxy.enabled"], havingValue = "true")
class KeycloakProxyController {

    @GetMapping("/realms/**")
    fun get(proxy: ProxyExchange<ByteArray?>, request: HttpServletRequest): ResponseEntity<*> {
        val response = proxy.uri("${oidcProperties.proxyUrl}${request.requestURI}").get()
        return if (isHtmlResponse(response)) {
            rewriteHtmlResponse(response, request)
        } else {
            response
        }
    }

    private fun rewriteHtmlResponse(response: ResponseEntity<*>, request: HttpServletRequest): ResponseEntity<*> {
        val targetOrigin = detectTargetOrigin(request)
        val rewrittenHtml = html
            .replace("http://keycloak:8080", targetOrigin)
            .replace("action=\"/realms/", "action=\"$targetOrigin/realms/")
    }

    private fun detectTargetOrigin(request: HttpServletRequest): String {
        // Détecte localhost:3000 (dev) ou localhost:8880 (CI) depuis les headers HTTP
        return when {
            request.getHeader("Referer")?.contains("localhost:3000") == true -> "http://localhost:3000"
            request.getHeader("Referer")?.contains("app:8880") == true -> "http://app:8880"
            else -> "http://localhost:8880"
        }
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

### 1. Dev mode (frontend:3000, backend:8880)

```
Frontend localhost:3000 → Login → Backend localhost:8880
  ↓
Backend redirige vers localhost:3000/realms/...
  ↓
Vite proxy /realms → Backend
  ↓
KeycloakProxyController détecte localhost:3000
  ↓
Keycloak reçoit requête et retourne HTML avec localhost:3000/realms/...
  ↓
Frontend soumets formulaire à localhost:3000/realms (via proxy)
  ↓
Token exchange: Backend ↔ Keycloak directement (localhost:8085)
  ↓
Frontend reçoit token, reste sur localhost:3000 ✅
```

### 2. CI mode (docker-compose.cypress.yml)

```
Frontend localhost:8880 → Login → Backend localhost:8880
  ↓
KeycloakProxyController détecte localhost:8880
  ↓
Keycloak reçoit requête et retourne HTML avec localhost:8880/realms/...
  ↓
Frontend complète auth, reste sur localhost:8880 ✅
```

### 3. Production
```
Backend → URL ProConnect publique
Keycloak → N/A (utilise ProConnect officiel)
Proxy → DÉSACTIVÉ (MONITORFISH_KEYCLOAK_PROXY_ENABLED non défini)
```

## Avantages

- ✅ Cypress fonctionne en dev mode (localhost:3000) sans erreurs d'origine
- ✅ Détection automatique : même code pour dev et CI
- ✅ Zéro impact en production (proxy désactivé)
- ✅ Configuration simple et centralisée

## Inconvénients

- ⚠️ Complexité OIDC : plusieurs URLs selon le contexte
- ⚠️ Code proxy à maintenir en développement

## Alternatives considérées

### Alternative 2 : Modifier Keycloak pour utiliser une seule URL
**Rejetée** : Impossible de faire fonctionner les communications backend-to-Keycloak

### Alternative 3 : Configurer Cypress pour accepter plusieurs domaines
**Rejetée** : Limitation technique de Cypress, pas de solution robuste

## Impact

- **Dev mode (localhost:3000)** : Cypress fonctionne ✅
- **CI mode (Docker)** : Cypress fonctionne ✅
- **Production** : Aucun impact (proxy désactivé)

## Validation

- ✅ `make run-cypress` fonctionne sans erreurs d'authentification
- ✅ Dev local avec frontend:3000 et backend:8880 fonctionne
- ✅ CI avec docker-compose.cypress.yml fonctionne
- ✅ Production non affectée

## Notes techniques

### Spring Boot 3.4 - Gestion des headers immuables

En Spring Boot 3.4+, les headers HTTP sont immuables. Solution: créer une nouvelle `ResponseEntity` au lieu de modifier les headers existants.

### Configuration requise

Keycloak doit accepter les deux redirect URIs (dev et CI):

```json
"redirectUris": [
  "http://localhost:8880/login/oauth2/code/proconnect",
  "http://localhost:3000/login/oauth2/code/proconnect",
  "http://localhost:8880",
  "http://localhost:3000"
]
```

### Sécurité en production

Le proxy Keycloak est protégé par une condition:

```kotlin
@ConditionalOnProperty(
    value = ["monitorfish.keycloak.proxy.enabled"],
    havingValue = "true",
    matchIfMissing = false
)
```

En production: `MONITORFISH_KEYCLOAK_PROXY_ENABLED` n'est pas défini → proxy désactivé ✅

