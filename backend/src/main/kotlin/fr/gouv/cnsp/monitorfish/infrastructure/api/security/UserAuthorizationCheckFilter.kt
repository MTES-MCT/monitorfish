package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.infrastructure.api.security.input.UserInfo
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.HttpHeaders.Authorization
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpFilter
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.core.annotation.Order

/**
 * This filter only check user authorization.
 * The JWT issuer public key signature is checked in WebSecurityConfig.kt
 */
@Order(1)
class UserAuthorizationCheckFilter(
    private val oidcProperties: OIDCProperties,
    private val apiClient: ApiClient,
    private val getIsAuthorizedUser: GetIsAuthorizedUser,
) : HttpFilter() {
    private val logger = LoggerFactory.getLogger(UserAuthorizationCheckFilter::class.java)
    private val BEARER_HEADER_TYPE = "Bearer"
    private val MALFORMED_BEARER_MESSAGE = "Malformed authorization header, header type should be 'Bearer'"
    private val MISSING_OIDC_ENDPOINT_MESSAGE = "Missing OIDC user info endpoint"
    private val COULD_NOT_FETCH_USER_INFO_MESSAGE = "Could not fetch user info at ${oidcProperties.userinfoEndpoint}"
    private val INSUFFICIENT_AUTHORIZATION_MESSAGE = "Insufficient authorization"

    override fun doFilter(request: HttpServletRequest?, response: HttpServletResponse?, chain: FilterChain?) = runBlocking {
        val authorizationHeaderContent = request?.getHeader("Authorization")
        val headerType: String? = authorizationHeaderContent?.split(" ")?.get(0)

        if (oidcProperties.enabled?.equals(false) == true) {
            logger.debug("OIDC disabled: user authorization is not checked.")
            chain?.doFilter(request, response)

            return@runBlocking
        }

        logger.debug("Authorization header: $authorizationHeaderContent")

        if (!headerType.equals(BEARER_HEADER_TYPE)) {
            logger.warn(MALFORMED_BEARER_MESSAGE)
            response!!.sendError(HttpServletResponse.SC_UNAUTHORIZED, MALFORMED_BEARER_MESSAGE)

            return@runBlocking
        }

        if (oidcProperties.userinfoEndpoint == null) {
            logger.warn(MISSING_OIDC_ENDPOINT_MESSAGE)
            response!!.sendError(HttpServletResponse.SC_UNAUTHORIZED, MISSING_OIDC_ENDPOINT_MESSAGE)

            return@runBlocking
        }

        try {
            val userInfoResponse = apiClient.httpClient.get(oidcProperties.userinfoEndpoint!!) {
                headers {
                    append(Authorization, authorizationHeaderContent!!)
                }
            }.body<UserInfo>()

            val isAuthorized = getIsAuthorizedUser.execute(userInfoResponse.email)
            if (!isAuthorized) {
                logger.debug(INSUFFICIENT_AUTHORIZATION_MESSAGE)
                response!!.sendError(HttpServletResponse.SC_UNAUTHORIZED, INSUFFICIENT_AUTHORIZATION_MESSAGE)
            }

            logger.debug(
                LoggedMessage("HTTP request: access granted.", hash(userInfoResponse.email), request!!.requestURI!!).toString(),
            )
            chain?.doFilter(request, response)
        } catch (e: Exception) {
            logger.error(COULD_NOT_FETCH_USER_INFO_MESSAGE, e)
            response!!.sendError(HttpServletResponse.SC_UNAUTHORIZED, COULD_NOT_FETCH_USER_INFO_MESSAGE)
        }
    }
}
