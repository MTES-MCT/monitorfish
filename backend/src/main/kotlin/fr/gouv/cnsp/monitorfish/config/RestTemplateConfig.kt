package fr.gouv.cnsp.monitorfish.config

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.client.ClientHttpRequestInterceptor
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.web.client.RestTemplate
import java.net.HttpURLConnection

@Configuration
class RestTemplateConfig {
    private val logger = LoggerFactory.getLogger(RestTemplateConfig::class.java)

    /**
     * ⚠️ DEVELOPMENT ONLY - RestTemplate configuration for Keycloak proxy
     *
     * This configuration is ONLY used by the KeycloakProxyController for local development and E2E testing.
     * It provides a RestTemplate that does NOT follow redirects automatically, which is critical for OAuth/OIDC flows.
     *
     * ❌ This configuration is NEVER enabled in production environments.
     * ✅ Only activated when `monitorfish.keycloak.proxy.enabled=true`
     */
    @Bean
    @ConditionalOnProperty(
        value = ["monitorfish.keycloak.proxy.enabled"],
        havingValue = "true",
        matchIfMissing = false,
    )
    fun restTemplateForProxy(restTemplateBuilder: RestTemplateBuilder): RestTemplate {
        logger.warn("⚠️ DEV MODE: RestTemplate configured for Keycloak proxy with redirect following disabled")

        // Configure request factory to NOT follow redirects
        // This is critical for OAuth/OIDC flows where redirects must be handled by the browser
        val requestFactory = object : SimpleClientHttpRequestFactory() {
            override fun prepareConnection(connection: HttpURLConnection, httpMethod: String) {
                super.prepareConnection(connection, httpMethod)
                connection.instanceFollowRedirects = false
            }
        }

        val restTemplate = restTemplateBuilder
            .requestFactory { -> requestFactory }
            .build()

        restTemplate.interceptors.add(
            ClientHttpRequestInterceptor { request, body, execution ->
                // Convert the body to a String if it's small enough (for logging purposes)
                val bodyString =
                    if (body.size <= 1024) {
                        String(
                            body,
                            Charsets.UTF_8,
                        )
                    } else {
                        "Request body too large to display"
                    }
                logger.info(
                    "[DEV-PROXY] OUTGOING PROXIED REQUEST ${request.method} ${request.uri} ${request.headers} $bodyString",
                )

                // Proceed with the request
                execution.execute(request, body)
            },
        )

        return restTemplate
    }

    @ConditionalOnProperty(
        value = ["monitorfish.keycloak.proxy.enabled"],
        havingValue = "false",
        matchIfMissing = true,
    )
    @Bean
    fun restTemplate(restTemplateBuilder: RestTemplateBuilder): RestTemplate {
        return restTemplateBuilder.build()
    }
}
