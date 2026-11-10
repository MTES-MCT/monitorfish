package fr.gouv.cnsp.monitorfish.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.http.CacheControl
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.util.concurrent.TimeUnit

/**
 * Lets browsers reuse the frontend files without a request (a round trip costs seconds on the satellite
 * connections of the patrol vessels). The other static files (as `index.html`) keep the default `no-cache`.
 */
@Configuration
class StaticResourcesCacheConfig(
    @param:Value("\${spring.web.resources.static-locations:}")
    private val staticLocations: List<String>,
) : WebMvcConfigurer {
    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        val locations = staticLocations.filter { it.isNotBlank() }.map { if (it.endsWith("/")) it else "$it/" }
        if (locations.isEmpty()) {
            return
        }

        // Vite adds a content hash to their names
        registry
            .addResourceHandler("/assets/**")
            .addResourceLocations(*locations.map { "${it}assets/" }.toTypedArray())
            .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable())

        registry
            .addResourceHandler("/flags/**")
            .addResourceLocations(*locations.map { "${it}flags/" }.toTypedArray())
            .setCacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
    }
}
