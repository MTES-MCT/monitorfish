package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.autoconfigure.web.WebProperties
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
    private val webProperties: WebProperties,
) : WebMvcConfigurer {
    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        // The same locations as Spring Boot's default static resources handler: the configured ones,
        // and the document root of the servlet context (`public/` in the working directory, as in the Docker image)
        val staticLocations =
            webProperties.resources.staticLocations
                .map { if (it.endsWith("/")) it else "$it/" }
                .plus("/")

        // Vite adds a content hash to their names
        registry
            .addResourceHandler("/assets/**")
            .addResourceLocations(*staticLocations.map { "${it}assets/" }.toTypedArray())
            .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable())

        registry
            .addResourceHandler("/flags/**")
            .addResourceLocations(*staticLocations.map { "${it}flags/" }.toTypedArray())
            .setCacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())

        // Requested again by the browser each time the map updates the URL
        registry
            .addResourceHandler("/favicon*.ico")
            .addResourceLocations(*staticLocations.toTypedArray())
            .setCacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
    }
}
