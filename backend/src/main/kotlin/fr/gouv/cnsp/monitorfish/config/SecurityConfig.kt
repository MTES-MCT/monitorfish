package fr.gouv.cnsp.monitorfish.config

import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.SpaController.Companion.FRONTEND_APP_ROUTES
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.core.AuthenticationException
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.AuthenticationFailureHandler
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
    val oidcProperties: OIDCProperties,
    val clientRegistrationRepository: ClientRegistrationRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(SecurityConfig::class.java)

    @Bean
    fun customOidcUserService(): OidcUserService {
        return object : OidcUserService() {
            override fun loadUser(userRequest: OidcUserRequest): OidcUser {
                try {
                    val oidcUser = super.loadUser(userRequest)
                    val siretsClaimRaw = oidcUser.claims["SIRET"]

                    val tokenSirets: Set<String> =
                        when (siretsClaimRaw) {
                            is List<*> -> siretsClaimRaw.filterIsInstance<String>().toSet()
                            is String -> setOf(siretsClaimRaw)
                            else -> throw OAuth2AuthenticationException("SIRET claim missing or malformed")
                        }

                    val isAuthorized = oidcProperties.authorizedSirets.any { it in tokenSirets }
                    if (!isAuthorized) {
                        throw OAuth2AuthenticationException("User not authorized for the requested SIRET(s)")
                    }

                    return oidcUser
                } catch (e: Exception) {
                    logger.error("⛔ Exception in loadUser", e)
                    throw e
                }
            }
        }
    }

    private fun oidcLogoutSuccessHandler(): LogoutSuccessHandler {
        val oidcLogoutSuccessHandler =
            OidcClientInitiatedLogoutSuccessHandler(this.clientRegistrationRepository)

        oidcLogoutSuccessHandler.setPostLogoutRedirectUri(oidcProperties.successUrl)

        return LogoutSuccessHandler { request, response, authentication ->
            logger.info("OIDC Logout initiated.")
            oidcLogoutSuccessHandler.onLogoutSuccess(request, response, authentication)
        }
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .authorizeHttpRequests { authorize ->
                if (oidcProperties.enabled == null || oidcProperties.enabled == false) {
                    logger.warn(
                        """
                        ⚠️   WARNING ⚠️   - OIDC Authentication is DISABLED.
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
                            *FRONTEND_APP_ROUTES.toTypedArray(),
                            "/*.jpg",
                            "/*.js",
                            "/*.png",
                            "/*.svg",
                            "/api/**",
                            "/asset-manifest.json",
                            "/assets/**",
                            // Used to redirect to the frontend SPA, see SpaController.kt
                            "/error",
                            "/favicon-32.ico",
                            "/favicon.ico",
                            "/flags/**",
                            "/index.html",
                            "/map-icons/**",
                            "/proxy/**",
                            "/realms/**",
                            "/resources/**",
                            "/robots.txt",
                            "/static/**",
                            "/examples/**",
                            "/swagger-ui/**",
                            "/version",
                        ).permitAll()
                        .anyRequest()
                        .authenticated()
                }
            }.oauth2Login { oauth2 ->
                oauth2
                    .userInfoEndpoint { userInfo ->
                        userInfo.oidcUserService(customOidcUserService())
                    }.loginPage(oidcProperties.loginUrl)
                    .successHandler(successHandler())
                    .failureHandler(authenticationFailureHandler())
            }.logout { logout ->
                logout
                    .logoutSuccessHandler(oidcLogoutSuccessHandler())
                    .logoutRequestMatcher(AntPathRequestMatcher("/logout", "GET"))
                    .invalidateHttpSession(true)
                    .clearAuthentication(true)
                    .deleteCookies("JSESSIONID")
            }.csrf { csrf ->
                csrf.ignoringRequestMatchers("/oauth2/**", "/login/oauth2/**", "/realms/**")
            }

        return http.build()
    }

    @Bean
    fun successHandler(): AuthenticationSuccessHandler {
        logger.info("Redirect URL is: '${oidcProperties.successUrl}'")
        return SimpleUrlAuthenticationSuccessHandler(oidcProperties.successUrl)
    }

    @Bean
    fun authenticationFailureHandler(): AuthenticationFailureHandler =
        object : SimpleUrlAuthenticationFailureHandler(oidcProperties.errorUrl) {
            override fun onAuthenticationFailure(
                request: HttpServletRequest,
                response: HttpServletResponse,
                exception: AuthenticationException,
            ) {
                logger.error("Authentication failed: ${exception.message}", exception)

                // response.sendRedirect("/logout")

                super.onAuthenticationFailure(request, response, exception)
            }
        }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration =
            CorsConfiguration().apply {
                allowedOriginPatterns = listOf("*")
                allowedMethods = listOf("HEAD", "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                allowedHeaders = listOf("Authorization", "Cache-Control", "Content-Type")
                allowCredentials = true
            }

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)

        return source
    }
}
