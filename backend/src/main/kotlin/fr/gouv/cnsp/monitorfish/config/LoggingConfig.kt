package fr.gouv.cnsp.monitorfish.config

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.infrastructure.api.CORRELATION_ID_PRECEDANCE
import fr.gouv.cnsp.monitorfish.infrastructure.api.LOG_REQUEST_PRECEDANCE
import fr.gouv.cnsp.monitorfish.infrastructure.api.log.CorrelationInterceptor
import fr.gouv.cnsp.monitorfish.infrastructure.api.log.LogGETRequests
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class LoggingConfig(val mapper: ObjectMapper) : WebMvcConfigurer {
    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(CorrelationInterceptor()).order(CORRELATION_ID_PRECEDANCE)
        registry.addInterceptor(LogGETRequests(mapper)).order(LOG_REQUEST_PRECEDANCE)
    }
}
