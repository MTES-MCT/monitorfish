package fr.gouv.cnsp.monitorfish.config

import org.springframework.cloud.gateway.mvc.config.ProxyExchangeArgumentResolver
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestTemplate
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/**
 * Used by the Keycloak proxy
 */
@Configuration
class CustomProxyExchangeConfig(private val restTemplate: RestTemplate) : WebMvcConfigurer {
    override fun addArgumentResolvers(resolvers: MutableList<HandlerMethodArgumentResolver>) {
        // Add the custom ProxyExchangeArgumentResolver with the custom RestTemplate
        resolvers.add(ProxyExchangeArgumentResolver(restTemplate))
    }
}
