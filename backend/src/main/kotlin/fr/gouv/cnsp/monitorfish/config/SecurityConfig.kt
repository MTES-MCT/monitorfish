package fr.gouv.cnsp.monitorfish.config

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(val oidcProperties: OIDCProperties) {
    private val logger: Logger = LoggerFactory.getLogger(SecurityConfig::class.java)

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .authorizeHttpRequests { authorize ->
                if (oidcProperties.enabled == null || oidcProperties.enabled == false) {
                    logger.warn(
                        """
                        ⚠️   WARNING ⚠️   - OIDC Authentication is NOT enabled.
                        """.trimIndent(),
                    )

                    authorize.requestMatchers("/**").permitAll()
                } else {
                    logger.warn(
                        """
                        ✅ OIDC Authentication is enabled.
                        """.trimIndent(),
                    )

                    authorize.requestMatchers(
                        "/",
                        "/backoffice",
                        "/backoffice/**",
                        "/ext",
                        "/light",
                        "/load_light",
                        "/index.html",
                        "/*.js",
                        "/*.png",
                        "/*.svg",
                        "/static/**",
                        "/assets/**",
                        "/map-icons/**",
                        "/flags/**",
                        "/robots.txt",
                        "/favicon-32.ico",
                        "/asset-manifest.json",
                        "/swagger-ui/**",
                        // Used to redirect to the frontend SPA, see SpaController.kt
                        "/error",
                        "/api/**",
                        "/version",
                    ).permitAll()
                        .anyRequest().authenticated()
                        .and()
                        .oauth2ResourceServer()
                        .jwt()
                }
            }

        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration().apply {
            allowedOrigins = listOf("*")
            allowedMethods = listOf("HEAD", "GET", "POST", "PUT", "DELETE")
            allowedHeaders = listOf("Authorization", "Cache-Control", "Content-Type")
        }

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)

        return source
    }
}
