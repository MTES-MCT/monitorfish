package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

/**
 * ⚠️ DEVELOPMENT ONLY - Keycloak Proxy Configuration
 *
 * This configuration is ONLY used for local development and E2E testing.
 * It controls whether the KeycloakProxyController is enabled to proxy
 * authentication requests to a Keycloak server during development.
 *
 * ❌ This should NEVER be enabled in production environments.
 * ✅ Only used for local development and Cypress E2E tests.
 */
@Configuration
@ConfigurationProperties(prefix = "monitorfish.keycloak.proxy")
class KeycloakProxyProperties {
    /**
     * ⚠️ DEVELOPMENT ONLY - Enable Keycloak proxy controller
     *
     * This property is only used in development: local environment and cypress tests.
     * When enabled, the KeycloakProxyController will proxy authentication requests
     * to a Keycloak server and rewrite URLs for local development.
     *
     * Default: false (disabled)
     * Production: Must always be false
     */
    var enabled: Boolean = false
}
