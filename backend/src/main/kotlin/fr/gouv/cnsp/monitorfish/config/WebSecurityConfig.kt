package fr.gouv.cnsp.monitorfish.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class WebSecurityConfig(val oidcProperties: OIDCProperties) {

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests { authorize ->
                if (oidcProperties.enabled == null || oidcProperties.enabled == false) {
                    authorize.requestMatchers(AntPathRequestMatcher("/**")).permitAll()
                } else {
                    authorize.requestMatchers(
                        AntPathRequestMatcher("/"),
                        AntPathRequestMatcher("/api/**"),
                        AntPathRequestMatcher("/version"),
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
