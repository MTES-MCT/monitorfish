package fr.gouv.cnsp.monitorfish.infrastructure.api.log

import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component
import java.io.IOException

@Component
class CustomAuthenticationSuccessHandler : AuthenticationSuccessHandler {
    private val logger = LoggerFactory.getLogger(LogGETRequests::class.java)

    @Throws(IOException::class, ServletException::class)
    override fun onAuthenticationSuccess(
        request: HttpServletRequest?,
        response: HttpServletResponse?,
        authentication: Authentication?,
    ) {
        if (authentication?.principal is DefaultOidcUser) {
            val oidcUser = authentication.principal as DefaultOidcUser
            val idToken = oidcUser.idToken

            if (idToken != null) {
                val email = idToken.getClaim<String>("email")
                if (email != null) {
                    logger.info("Authentication succeeded with JWT for user: $email.")
                }
            }
        }
    }
}
