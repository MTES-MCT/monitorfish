package fr.gouv.cnsp.monitorfish.config

import fr.gouv.cnsp.monitorfish.infrastructure.api.CorrelationInterceptor
import fr.gouv.cnsp.monitorfish.infrastructure.api.HttpGETLogging
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig : WebMvcConfigurer {
    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(CorrelationInterceptor())
        registry.addInterceptor(HttpGETLogging())
    }
}
