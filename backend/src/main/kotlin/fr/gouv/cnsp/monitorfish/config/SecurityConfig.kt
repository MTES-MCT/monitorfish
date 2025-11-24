package fr.gouv.cnsp.monitorfish.config

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.SpaController.Companion.FRONTEND_APP_ROUTES
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.Logger
import org.slf4j.LoggerFactory
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
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.AuthenticationFailureHandler
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import org.springframework.web.client.RestTemplate
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import java.util.Base64

@Configuration
@EnableWebSecurity
class SecurityConfig(
    val oidcProperties: OIDCProperties,
    val clientRegistrationRepository: ClientRegistrationRepository?,
) {
    private val logger: Logger = LoggerFactory.getLogger(SecurityConfig::class.java)

    @Bean
    @ConditionalOnProperty(value = ["monitorfish.oidc.enabled"], havingValue = "true")
    fun customOidcUserService(): OidcUserService {
        return object : OidcUserService() {
            private val restTemplate = RestTemplate()
            private val objectMapper = ObjectMapper()

            override fun loadUser(userRequest: OidcUserRequest): OidcUser =
                try {
                    val oidcUser = super.loadUser(userRequest)

                    validateAndProcessUser(oidcUser)
                } catch (e: Exception) {
                    // ProConnect returns userinfo as JWT instead of JSON
                    if (e.message?.contains("application/jwt") == true) {
                        logger.info("UserInfo endpoint returned JWT content type, decoding JWT response...")

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
                val userInfoUri = userRequest.clientRegistration.providerDetails.userInfoEndpoint.uri
                val accessToken = userRequest.accessToken.tokenValue

                logger.debug("Fetching JWT userinfo from: $userInfoUri")

                val headers =
                    HttpHeaders().apply {
                        setBearerAuth(accessToken)
                    }

                val response =
                    restTemplate.exchange(
                        userInfoUri,
                        HttpMethod.GET,
                        HttpEntity<String>(headers),
                        String::class.java,
                    )

                val jwtToken = response.body ?: throw IllegalArgumentException("Empty userinfo response")

                val claims = decodeJwtClaims(jwtToken)
                logger.debug("Successfully decoded JWT userinfo with claims: ${claims.keys}")

                // Create OidcUserInfo and OidcUser with the decoded claims
                val userInfo = OidcUserInfo(claims)
                return DefaultOidcUser(
                    emptyList<GrantedAuthority>(),
                    userRequest.idToken,
                    userInfo,
                )
            }

            private fun decodeJwtClaims(jwtToken: String): Map<String, Any> {
                val parts = jwtToken.split(".")
                if (parts.size != 3) {
                    throw IllegalArgumentException("Invalid JWT format: expected 3 parts, got ${parts.size}")
                }

                val payloadBase64 = parts[1]
                val decodedBytes = Base64.getUrlDecoder().decode(payloadBase64)
                val payloadJson = String(decodedBytes, Charsets.UTF_8)

                @Suppress("UNCHECKED_CAST")
                return objectMapper.readValue(payloadJson, LinkedHashMap::class.java) as Map<String, Any>
            }

            private fun validateAndProcessUser(oidcUser: OidcUser): OidcUser {
                logger.debug("========== Email Domain Validation ==========")
                logger.debug("MONITORFISH_OIDC_BYPASS_EMAIL_DOMAINS_FILTER=${oidcProperties.bypassEmailDomainsFilter}")

                if (oidcProperties.bypassEmailDomainsFilter == "true") {
                    logger.info("✅ OIDC is bypassing email domain checks.")
                    return oidcUser
                }

                val emailClaim = oidcUser.claims["email"] as? String
                logger.debug("User email from JWT: $emailClaim")

                if (emailClaim.isNullOrBlank()) {
                    val errorMsg = "Email claim is missing or empty in JWT"
                    logger.error("❌ $errorMsg")
                    throw OAuth2AuthenticationException(errorMsg)
                }

                val emailDomain = emailClaim.substringAfterLast("@")
                logger.debug("Extracted email domain: $emailDomain")
                logger.debug("Configured authorized email domains: ${oidcProperties.authorizedEmailDomains}")

                val isAuthorized =
                    oidcProperties.authorizedEmailDomains.any { domain ->
                        emailDomain.equals(domain, ignoreCase = true)
                    }

                if (!isAuthorized) {
                    val errorMsg =
                        "User not authorized. Email domain '$emailDomain' does not match any authorized domain: ${oidcProperties.authorizedEmailDomains}"
                    logger.error("❌ $errorMsg")
                    throw OAuth2AuthenticationException(errorMsg)
                }

                logger.info("✅ User authorized with email domain: $emailDomain")
                logger.debug("========== End Email Domain Validation ==========")
                return oidcUser
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
            .csrf { it.disable() }
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
            }

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
                        .logoutSuccessHandler(oidcLogoutSuccessHandler())
                        .logoutRequestMatcher(AntPathRequestMatcher("/logout", "GET"))
                        .invalidateHttpSession(true)
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
                        ?: exception.cause?.message
                        ?: exception.javaClass.simpleName

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
