package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import org.springframework.security.oauth2.core.oidc.user.OidcUser

object Utils {
    fun getEmail(principal: Any) =
        (principal as? OidcUser)?.email
            ?: throw IllegalStateException("Authenticated user is not an OidcUser")
}
