package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.ProtectedPathsAPIProperties
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.filter.OncePerRequestFilter

/**
 * This filter only check user authorization.
 * The JWT issuer public key signature is checked in SecurityConfig.kt
 */
class UserAuthorizationCheckFilter(
    private val oidcProperties: OIDCProperties,
    private val protectedPathsAPIProperties: ProtectedPathsAPIProperties,
    private val getIsAuthorizedUser: GetIsAuthorizedUser,
) : OncePerRequestFilter() {
    private val INSUFFICIENT_AUTHORIZATION_MESSAGE = "Insufficient authorization"
    private val MISSING_AUTHENTICATED_USER_MESSAGE = "Missing authenticated user"

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val authentication = SecurityContextHolder.getContext().authentication

        if (oidcProperties.enabled?.equals(false) == true) {
            logger.debug("OIDC disabled: user authorization is not checked.")
            filterChain.doFilter(request, response)

            return
        }

        if (authentication == null || !authentication.isAuthenticated) {
            logger.warn(MISSING_AUTHENTICATED_USER_MESSAGE)
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, MISSING_AUTHENTICATED_USER_MESSAGE)

            return
        }

        val email = (authentication.principal as? OidcUser)?.email
        if (email == null) {
            logger.warn(MISSING_AUTHENTICATED_USER_MESSAGE)
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, MISSING_AUTHENTICATED_USER_MESSAGE)

            return
        }
        logger.info("Authenticated user email/username: $email")

        val isSuperUserPath =
            protectedPathsAPIProperties.superUserPaths?.any {
                request.requestURI.contains(
                    it,
                )
            } ?: false
        val isAuthorized = getIsAuthorizedUser.execute(email, isSuperUserPath)
        if (!isAuthorized) {
            logger.info("$INSUFFICIENT_AUTHORIZATION_MESSAGE: ${request.requestURI!!} ($email)")
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, INSUFFICIENT_AUTHORIZATION_MESSAGE)

            return
        }

        logger.info(
            LoggedMessage(
                "HTTP request: access granted.",
                email,
                request.requestURI!!,
            ).toString(),
        )

        filterChain.doFilter(request, response)
    }
}
