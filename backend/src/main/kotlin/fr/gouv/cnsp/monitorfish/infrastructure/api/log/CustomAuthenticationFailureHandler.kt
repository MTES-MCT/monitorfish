package fr.gouv.cnsp.monitorfish.infrastructure.api.log

import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.authentication.AuthenticationFailureHandler
import org.springframework.stereotype.Component
import java.io.IOException

@Component
class CustomAuthenticationFailureHandler : AuthenticationFailureHandler {
    private val logger = LoggerFactory.getLogger(LogGETRequests::class.java)

    @Throws(IOException::class, ServletException::class)
    override fun onAuthenticationFailure(
        request: HttpServletRequest?,
        response: HttpServletResponse?,
        exception: AuthenticationException?,
    ) {
        logger.info("Authentication failure during JWT verification: ${exception?.message}.")
    }
}
