package fr.gouv.cnsp.monitorfish.config

import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAllowedToLogIn
import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.SpaController.Companion.FRONTEND_APP_ROUTES
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.ObjectProvider
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.oidc.OidcUserInfo
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.AuthenticationFailureHandler
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler
import org.springframework.security.web.csrf.CsrfFilter
import org.springframework.security.web.csrf.CsrfToken
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher
import org.springframework.security.web.util.matcher.AndRequestMatcher
import org.springframework.web.client.RestTemplate
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.OncePerRequestFilter
import java.net.URI
import java.net.URISyntaxException

@Configuration
@EnableWebSecurity
class SecurityConfig(
    val oidcProperties: OIDCProperties,
    val clientRegistrationRepository: ClientRegistrationRepository?,
    // Lazily resolved: the use case is only needed at login, and sliced web tests don't load it
    private val getIsAllowedToLogIn: ObjectProvider<GetIsAllowedToLogIn>,
) {
    private val logger: Logger = LoggerFactory.getLogger(SecurityConfig::class.java)

    @Bean
    @ConditionalOnProperty(value = ["monitorfish.oidc.enabled"], havingValue = "true")
    fun customOidcUserService(): OidcUserService {
        return object : OidcUserService() {
            private val restTemplate = RestTemplate()
            private var userInfoJwtDecoder: JwtDecoder? = null

            override fun loadUser(userRequest: OidcUserRequest): OidcUser =
                try {
                    val oidcUser = super.loadUser(userRequest)

                    validateAndProcessUser(oidcUser)
                } catch (e: Exception) {
                    // ProConnect returns userinfo as JWT instead of JSON
                    if (e.message?.contains("application/jwt") == true) {
                        logger.info(
                            "UserInfo endpoint returned JWT content type, decoding JWT response...",
                        )

                        try {
                            val oidcUser = loadUserFromJwtUserInfo(userRequest)

                            validateAndProcessUser(oidcUser)
                        } catch (jwtError: Exception) {
                            logger.error("⛔ Failed to decode JWT userinfo response", jwtError)

                            throw OAuth2AuthenticationException(
                                OAuth2Error(
                                    "invalid_user_info_response",
                                    "Failed to decode JWT userinfo response: ${jwtError.message}",
                                    null,
                                ),
                                jwtError as Throwable,
                            )
                        }
                    } else {
                        logger.error("⛔ Exception in loadUser", e)
                        throw e
                    }
                }

            private fun loadUserFromJwtUserInfo(userRequest: OidcUserRequest): OidcUser {
                val userInfoUri =
                    userRequest.clientRegistration.providerDetails.userInfoEndpoint.uri
                        ?: throw IllegalArgumentException("Missing userinfo endpoint URI")
                val accessToken = userRequest.accessToken.tokenValue

                logger.debug("Fetching JWT userinfo from: $userInfoUri")

                val headers = HttpHeaders().apply { setBearerAuth(accessToken) }

                val response =
                    restTemplate.exchange(
                        userInfoUri,
                        HttpMethod.GET,
                        HttpEntity<String>(headers),
                        String::class.java,
                    )

                val jwtToken = response.body ?: throw IllegalArgumentException("Empty userinfo response")

                val claims = decodeAndVerifyJwtClaims(userRequest, jwtToken)
                logger.debug("Successfully decoded JWT userinfo with claims: ${claims.keys}")

                require(claims["sub"] == userRequest.idToken.subject) {
                    "UserInfo `sub` claim does not match the ID token subject"
                }

                // Create OidcUserInfo and OidcUser with the decoded claims
                val userInfo = OidcUserInfo(claims)
                return DefaultOidcUser(
                    emptyList<GrantedAuthority>(),
                    userRequest.idToken,
                    userInfo,
                )
            }

            private fun decodeAndVerifyJwtClaims(
                userRequest: OidcUserRequest,
                jwtToken: String,
            ): Map<String, Any> {
                val jwkSetUri =
                    userRequest.clientRegistration.providerDetails.jwkSetUri
                        ?: throw IllegalArgumentException("Missing JWK set URI")
                val decoder =
                    userInfoJwtDecoder
                        ?: NimbusJwtDecoder
                            .withJwkSetUri(jwkSetUri)
                            .jwsAlgorithms { it.addAll(listOf(SignatureAlgorithm.RS256, SignatureAlgorithm.ES256)) }
                            .build()
                            .also { userInfoJwtDecoder = it }

                return decoder.decode(jwtToken).claims
            }

            private fun validateAndProcessUser(oidcUser: OidcUser): OidcUser {
                val email = oidcUser.claims["email"] as? String
                if (email.isNullOrBlank()) {
                    val errorMsg = "Email claim is missing or empty in JWT"
                    logger.error("❌ $errorMsg")
                    throw OAuth2AuthenticationException(errorMsg)
                }

                val idpId = oidcUser.claims["idp_id"] as? String
                val organizationalUnit = oidcUser.claims["organizational_unit"] as? String
                logger.debug("User idp_id: $idpId, organizational_unit: $organizationalUnit")

                val isAllowed =
                    getIsAllowedToLogIn.getObject().execute(
                        email,
                        idpId,
                        oidcUser.subject,
                        organizationalUnit,
                    )
                if (!isAllowed) {
                    val errorMsg = "User not authorized (idp_id: '$idpId', organizational_unit: '$organizationalUnit')."
                    logger.error("❌ $errorMsg")
                    throw OAuth2AuthenticationException(errorMsg)
                }

                return oidcUser
            }
        }
    }

    private fun oidcLogoutSuccessHandler(
        clientRegistrationRepository: ClientRegistrationRepository,
    ): LogoutSuccessHandler {
        val oidcLogoutSuccessHandler =
            OidcClientInitiatedLogoutSuccessHandler(clientRegistrationRepository)

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
            .csrf { csrf ->
                if (oidcProperties.enabled == true) {
                    // Only the session-authenticated `/bff` API needs it: `/api` is called by other apps with an API key
                    csrf
                        .spa()
                        .requireCsrfProtectionMatcher(
                            AndRequestMatcher(
                                CsrfFilter.DEFAULT_CSRF_MATCHER,
                                PathPatternRequestMatcher.withDefaults().matcher("/bff/**"),
                            ),
                        )
                } else {
                    csrf.disable()
                }
            }.authorizeHttpRequests { authorize ->
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
                            "/faviconBW.ico",
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
            }

        if (oidcProperties.enabled == true) {
            http.addFilterAfter(CsrfCookieFilter(), CsrfFilter::class.java)
        }

        // Bound to a local so the null check smart-casts: the Kotlin Spring plugin opens this class,
        // which makes the property getter open.
        val clientRegistrationRepository = this.clientRegistrationRepository
        if (oidcProperties.enabled == true && clientRegistrationRepository != null) {
            http
                .oauth2Login { oauth2 ->
                    oauth2
                        .userInfoEndpoint { userInfo ->
                            userInfo.oidcUserService(customOidcUserService())
                        }.loginPage(oidcProperties.loginUrl)
                        .successHandler(successHandler())
                        .failureHandler(authenticationFailureHandler())
                }.logout { logout ->
                    logout
                        .logoutSuccessHandler(oidcLogoutSuccessHandler(clientRegistrationRepository))
                        .logoutRequestMatcher(
                            PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/logout"),
                        ).invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                }
        }

        return http.build()
    }

    @Bean
    @ConditionalOnProperty(value = ["monitorfish.oidc.enabled"], havingValue = "true")
    fun successHandler(): AuthenticationSuccessHandler {
        logger.info("Redirect URL is: '${oidcProperties.successUrl}'")
        return SimpleUrlAuthenticationSuccessHandler(oidcProperties.successUrl)
    }

    @Bean
    @ConditionalOnProperty(value = ["monitorfish.oidc.enabled"], havingValue = "true")
    fun authenticationFailureHandler(): AuthenticationFailureHandler =
        object : SimpleUrlAuthenticationFailureHandler(oidcProperties.errorUrl) {
            override fun onAuthenticationFailure(
                request: HttpServletRequest,
                response: HttpServletResponse,
                exception: AuthenticationException,
            ) {
                val errorMessage =
                    exception.message
                        ?: exception.cause?.message ?: exception.javaClass.simpleName

                logger.error("❌ Authentication failed: $errorMessage", exception)

                // Log the full exception chain for debugging
                if (exception.cause != null) {
                    logger.error(
                        "Caused by: ${exception.cause?.javaClass?.simpleName} - ${exception.cause?.message}",
                    )
                }

                super.onAuthenticationFailure(request, response, exception)
            }
        }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        // Called by MonitorEnv and RapportNav (protected by API key on public paths, not by the session)
        val externalApiConfiguration =
            CorsConfiguration().apply {
                allowedOriginPatterns = listOf("*")
                allowedMethods = listOf("HEAD", "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                allowedHeaders = listOf("Authorization", "Cache-Control", "Content-Type")
                allowCredentials = true
            }
        val sessionConfiguration =
            CorsConfiguration().apply {
                allowedOrigins = getSessionAllowedOrigins()
                allowedMethods = listOf("HEAD", "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                allowedHeaders = listOf("Authorization", "Cache-Control", "Content-Type", CSRF_HEADER_NAME)
                allowCredentials = true
            }
        logger.info("CORS allowed origins for session-authenticated endpoints: ${sessionConfiguration.allowedOrigins}")

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/api/**", externalApiConfiguration)
        // Local Keycloak proxy (development and E2E only): its login form is posted with `Origin: null`,
        // as Keycloak pages are served with `Referrer-Policy: no-referrer`
        source.registerCorsConfiguration("/realms/**", externalApiConfiguration)
        source.registerCorsConfiguration("/**", sessionConfiguration)

        return source
    }

    private fun getSessionAllowedOrigins(): List<String> {
        val configuredOrigins = oidcProperties.allowedOrigins.map { it.trim().trimEnd('/') }.filter { it.isNotEmpty() }
        if (configuredOrigins.isNotEmpty()) {
            return configuredOrigins
        }

        return try {
            val successUri = URI(oidcProperties.successUrl)
            if (successUri.scheme == null || successUri.host == null) {
                return listOf()
            }
            val port = if (successUri.port == -1) "" else ":${successUri.port}"

            listOf("${successUri.scheme}://${successUri.host}$port")
        } catch (_: URISyntaxException) {
            listOf()
        }
    }

    /** Spring Security loads the CSRF token lazily: the frontend needs its cookie before its first mutation. */
    private class CsrfCookieFilter : OncePerRequestFilter() {
        override fun doFilterInternal(
            request: HttpServletRequest,
            response: HttpServletResponse,
            filterChain: FilterChain,
        ) {
            (request.getAttribute(CsrfToken::class.java.name) as? CsrfToken)?.token
            filterChain.doFilter(request, response)
        }
    }

    companion object {
        const val CSRF_HEADER_NAME = "X-XSRF-TOKEN"
    }
}
