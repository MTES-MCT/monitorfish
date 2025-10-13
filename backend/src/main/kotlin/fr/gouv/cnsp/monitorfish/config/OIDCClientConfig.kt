package fr.gouv.cnsp.monitorfish.config

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.client.registration.ClientRegistration
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository
import org.springframework.security.oauth2.core.AuthorizationGrantType
import org.springframework.security.oauth2.core.ClientAuthenticationMethod
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2TokenValidator
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoderFactory
import org.springframework.security.oauth2.jwt.JwtValidators
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder

@Configuration
@ConditionalOnProperty(value = ["monitorfish.oidc.enabled"], havingValue = "true")
class OIDCClientConfig(
    private val oidcProperties: OIDCProperties,
) {
    private val logger: Logger = LoggerFactory.getLogger(OIDCClientConfig::class.java)

    @Bean
    fun clientRegistrationRepository(): ClientRegistrationRepository {
        logger.info("Creating OIDC client registration")

        val clientId = validateProperty(oidcProperties.clientId, "Client ID")
        val clientSecret = validateProperty(oidcProperties.clientSecret, "Client Secret")
        val redirectUri = validateProperty(oidcProperties.redirectUri, "Redirect URI")
        val issuerUri = validateProperty(oidcProperties.issuerUri, "Issuer URI")
        val authorizationUri = validateProperty(oidcProperties.authorizationUri, "Authorization URI")
        val tokenUri = validateProperty(oidcProperties.tokenUri, "Token URI")
        val userInfoUri = validateProperty(oidcProperties.userInfoUri, "User Info URI")
        val jwkSetUri = validateProperty(oidcProperties.jwkSetUri, "JWK URI")

        val clientRegistration =
            ClientRegistration
                .withRegistrationId("proconnect")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri(redirectUri)
                .scope("openid", "email", "siret")
                .authorizationUri(authorizationUri)
                .tokenUri(tokenUri)
                .userInfoUri(userInfoUri)
                .userNameAttributeName("email")
                .jwkSetUri(jwkSetUri)
                .issuerUri(issuerUri)
                .clientName("ProConnect")
                .build()

        logger.info("✅ OIDC client registration created successfully for client: $clientId")
        return InMemoryClientRegistrationRepository(clientRegistration)
    }

    /**
     * Creates a JWT decoder factory with custom issuer validation for development/testing environments.
     *
     * ⚠️ DEVELOPMENT ONLY: When `issuerUriExternal` is configured (e.g., for Keycloak proxy in Cypress tests),
     * this factory creates decoders that accept both internal and external issuers.
     * In production (when `issuerUriExternal` is not set), standard issuer validation is used.
     */
    @ConditionalOnProperty(
        value = ["monitorfish.keycloak.proxy.enabled"],
        havingValue = "true",
        matchIfMissing = false,
    )
    @Bean
    fun jwtDecoderFactory(): JwtDecoderFactory<ClientRegistration> {
        val issuerUri = validateProperty(oidcProperties.issuerUri, "Issuer URI")
        val externalIssuer = oidcProperties.issuerUriExternal

        return JwtDecoderFactory { clientRegistration ->
            val jwkSetUri = clientRegistration.providerDetails.jwkSetUri
            val jwtDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build()

            // ⚠️ DEVELOPMENT ONLY: Custom issuer validation for Keycloak proxy
            // This code path is only taken when issuerUriExternal is configured (dev/test environments)
            if (externalIssuer.isNotBlank()) {
                logger.warn(
                    "⚠️ DEV MODE: Custom JWT issuer validation enabled for proxy. External issuer: $externalIssuer",
                )

                val issuerValidator =
                    OAuth2TokenValidator<Jwt> { jwt ->
                        val tokenIssuer = jwt.issuer?.toString()

                        // Accept either the internal issuer or the external (proxied) issuer
                        if (tokenIssuer == issuerUri || tokenIssuer == externalIssuer) {
                            logger.debug("JWT issuer validated: $tokenIssuer")
                            org.springframework.security.oauth2.core.OAuth2TokenValidatorResult
                                .success()
                        } else {
                            logger.error(
                                "JWT issuer validation failed. Expected: $issuerUri or $externalIssuer, but got: $tokenIssuer",
                            )
                            org.springframework.security.oauth2.core.OAuth2TokenValidatorResult.failure(
                                org.springframework.security.oauth2.core.OAuth2Error(
                                    "invalid_token",
                                    "The token issuer is invalid. Expected: $issuerUri or $externalIssuer, but got: $tokenIssuer",
                                    null,
                                ),
                            )
                        }
                    }

                val validators =
                    DelegatingOAuth2TokenValidator(
                        JwtValidators.createDefault(),
                        issuerValidator,
                    )
                jwtDecoder.setJwtValidator(validators)
            } else {
                // Production: use standard issuer validation
                jwtDecoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuerUri))
            }

            logger.debug("JWT decoder created for client: ${clientRegistration.clientId}")
            jwtDecoder
        }
    }

    private fun validateProperty(
        value: String,
        propertyName: String,
    ): String =
        value.takeIf { it.isNotBlank() }
            ?: throw IllegalArgumentException(
                "OIDC $propertyName is required but not configured. Please check your environment variables.",
            )
}
