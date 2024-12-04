package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.ProtectedPathsAPIProperties
import fr.gouv.cnsp.monitorfish.domain.repositories.OIDCRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.web.filter.OncePerRequestFilter

/**
 * This filter only check user authorization.
 * The JWT issuer public key signature is checked in SecurityConfig.kt
 */
class UserAuthorizationCheckFilter(
    private val oidcProperties: OIDCProperties,
    private val protectedPathsAPIProperties: ProtectedPathsAPIProperties,
    private val oidcRepository: OIDCRepository,
    private val getIsAuthorizedUser: GetIsAuthorizedUser,
) : OncePerRequestFilter() {
    companion object {
        val EMAIL_HEADER = "EMAIL"
    }

    private val BEARER_HEADER_TYPE = "Bearer"
    private val MALFORMED_BEARER_MESSAGE = "Malformed authorization header, header type should be 'Bearer'"
    private val MISSING_OIDC_ENDPOINT_MESSAGE = "Missing OIDC user info endpoint"
    private val MISSING_OIDC_ISSUER_ENDPOINT_MESSAGE = "Missing issuer URI endpoint"
    private val COULD_NOT_FETCH_USER_INFO_MESSAGE =
        "Could not fetch user info at ${oidcProperties.issuerUri + oidcProperties.userinfoEndpoint}"
    private val INSUFFICIENT_AUTHORIZATION_MESSAGE = "Insufficient authorization"

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val authorizationHeaderContent = request.getHeader("Authorization")
        val headerType: String? = authorizationHeaderContent?.split(" ")?.get(0)

        if (oidcProperties.enabled?.equals(false) == true) {
            logger.debug("OIDC disabled: user authorization is not checked.")
            filterChain.doFilter(request, response)

            return
        }

        logger.debug("Authorization header: $authorizationHeaderContent")

        if (!headerType.equals(BEARER_HEADER_TYPE)) {
            logger.warn(MALFORMED_BEARER_MESSAGE)
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, MALFORMED_BEARER_MESSAGE)

            return
        }

        if (oidcProperties.userinfoEndpoint == null) {
            logger.warn(MISSING_OIDC_ENDPOINT_MESSAGE)
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, MISSING_OIDC_ENDPOINT_MESSAGE)

            return
        }

        if (oidcProperties.issuerUri == null) {
            logger.warn(MISSING_OIDC_ISSUER_ENDPOINT_MESSAGE)
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, MISSING_OIDC_ISSUER_ENDPOINT_MESSAGE)

            return
        }

        try {
            val userInfo = oidcRepository.getUserInfo(authorizationHeaderContent!!)

            val isSuperUserPath =
                protectedPathsAPIProperties.superUserPaths?.any {
                    request.requestURI.contains(
                        it,
                    )
                } == true
            val isAuthorized = getIsAuthorizedUser.execute(userInfo.email, isSuperUserPath)
            if (!isAuthorized) {
                logger.info("$INSUFFICIENT_AUTHORIZATION_MESSAGE: ${request.requestURI!!} (${userInfo.email})")
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, INSUFFICIENT_AUTHORIZATION_MESSAGE)
            }

            logger.info(
                LoggedMessage(
                    "HTTP request: access granted.",
                    userInfo.email,
                    request.requestURI!!,
                ).toString(),
            )

            // The email is added as a header so the email will be known by the controller
            response.addHeader(EMAIL_HEADER, userInfo.email)

            filterChain.doFilter(request, response)
        } catch (e: Exception) {
            logger.warn(COULD_NOT_FETCH_USER_INFO_MESSAGE, e)
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, COULD_NOT_FETCH_USER_INFO_MESSAGE)
        }
    }
}
