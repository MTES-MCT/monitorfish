package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import fr.gouv.cnsp.monitorfish.config.ProtectedPathsAPIProperties
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.web.filter.OncePerRequestFilter

/**
 * This filter check the api key header
 */
class ApiKeyCheckFilter(
    private val protectedPathsAPIProperties: ProtectedPathsAPIProperties,
) : OncePerRequestFilter() {
    private val CUSTOM_API_KEY_HEADER = "x-api-key"
    private val INSUFFICIENT_AUTHORIZATION_MESSAGE = "Insufficient authorization"

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val apiKeyHeaderContent = request.getHeader(CUSTOM_API_KEY_HEADER)

        if (apiKeyHeaderContent != protectedPathsAPIProperties.apiKey) {
            logger.warn(INSUFFICIENT_AUTHORIZATION_MESSAGE)
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, INSUFFICIENT_AUTHORIZATION_MESSAGE)

            return
        }

        logger.info("Access granted to protected public API endpoint from IP: ${request.remoteAddr}.")
        filterChain.doFilter(request, response)
    }
}
