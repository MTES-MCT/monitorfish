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

    private fun validateProperty(
        value: String,
        propertyName: String,
    ): String =
        value.takeIf { it.isNotBlank() }
            ?: throw IllegalArgumentException(
                "OIDC $propertyName is required but not configured. Please check your environment variables.",
            )
}
