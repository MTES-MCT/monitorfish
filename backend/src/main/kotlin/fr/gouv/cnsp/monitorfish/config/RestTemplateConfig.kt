package fr.gouv.cnsp.monitorfish.config

import org.slf4j.LoggerFactory
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.client.ClientHttpRequestInterceptor
import org.springframework.web.client.RestTemplate

/**
 * Used by the Keycloak proxy
 */
@Configuration
class RestTemplateConfig {
    private val logger = LoggerFactory.getLogger(RestTemplateConfig::class.java)

    @Bean
    fun restTemplate(restTemplateBuilder: RestTemplateBuilder): RestTemplate {
        val restTemplate = restTemplateBuilder.build()

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
}
