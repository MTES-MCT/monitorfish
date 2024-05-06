package fr.gouv.cnsp.monitorfish.infrastructure.api.log

import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.stereotype.Component
import java.io.IOException

@Component
class CustomAuthenticationEntryPoint : AuthenticationEntryPoint {
    private val logger = LoggerFactory.getLogger(LogGETRequests::class.java)

    @Throws(IOException::class, ServletException::class)
    override fun commence(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authException: AuthenticationException,
    ) {
        logger.info("Authentication failure during JWT verification: ${authException.message}.")

        response.setHeader("WWW-Authenticate", authException.message)
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, authException.message)
    }
}
