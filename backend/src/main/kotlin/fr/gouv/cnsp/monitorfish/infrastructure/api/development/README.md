# Development-Only Controllers

⚠️ **WARNING: This package contains controllers that are ONLY for development use.**

## Purpose

This package contains Spring Boot controllers that are specifically designed for:
- Local development environments
- E2E (End-to-End) testing with Cypress

## ❌ Production Warning

**These controllers should NEVER be enabled in production environments.**

All controllers in this package use Spring's `@ConditionalOnProperty` annotation to ensure they are only active when explicitly enabled through configuration properties.

## Current Controllers

### KeycloakProxyController

- **Purpose**: Proxies authentication requests to a Keycloak server during development (Cypress require only one URI)
- **Activation**: Only when `monitorfish.keycloak.proxy.enabled=true`
- **Usage**: Local development and E2E testing with Keycloak authentication flows
- **Security**: Disabled by default, requires explicit configuration to enable

## Configuration

All development controllers require explicit configuration to be enabled:

```yaml
monitorfish:
  keycloak:
    proxy:
      enabled: false  # Must be explicitly set to true for development
```

## Guidelines

1. **Never enable these controllers in production**
2. **Always use `@ConditionalOnProperty` with `matchIfMissing = false`**
3. **Add clear documentation about development-only usage**
4. **Include warning logs when these controllers are active**
5. **Default all configuration properties to `false`**

## Package Structure

```
development/
├── README.md                   # This file
├── KeycloakProxyController.kt  # Keycloak authentication proxy
```
