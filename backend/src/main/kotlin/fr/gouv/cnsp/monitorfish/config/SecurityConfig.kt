package fr.gouv.cnsp.monitorfish.config

import fr.gouv.cnsp.monitorfish.infrastructure.api.log.CustomAuthenticationEntryPoint
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
    val oidcProperties: OIDCProperties,
    val authenticationEntryPoint: CustomAuthenticationEntryPoint,
) {
    private val logger: Logger = LoggerFactory.getLogger(SecurityConfig::class.java)

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors { it.configurationSource(corsConfigurationSource()) }
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

                    authorize
                        .requestMatchers(
                            "/",
                            "/*.jpg",
                            "/*.js",
                            "/*.png",
                            "/*.svg",
                            "/api/**",
                            "/asset-manifest.json",
                            "/assets/**",
                            "/backoffice",
                            "/backoffice/**",
                            // Used to redirect to the frontend SPA, see SpaController.kt
                            "/error",
                            "/ext",
                            "/favicon-32.ico",
                            "/favicon.ico",
                            "/flags/**",
                            "/index.html",
                            "/light",
                            "/load_light",
                            "/login",
                            "/map-icons/**",
                            "/proxy/**",
                            "/realms/**",
                            "/register",
                            "/resources/**",
                            "/robots.txt",
                            "/side_window",
                            "/static/**",
                            "/swagger-ui/**",
                            "/version",
                        ).permitAll()
                        .anyRequest()
                        .authenticated()
                }
            }.oauth2ResourceServer { oauth2ResourceServer ->
                oauth2ResourceServer
                    .jwt(Customizer.withDefaults())
                    .authenticationEntryPoint(authenticationEntryPoint)
            }

        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration =
            CorsConfiguration().apply {
                allowedOrigins = listOf("*")
                allowedMethods = listOf("HEAD", "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                allowedHeaders = listOf("Authorization", "Cache-Control", "Content-Type")
            }

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)

        return source
    }
}
