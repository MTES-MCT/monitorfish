package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.infrastructure.api.security.UserAuthorizationCheckFilter
import jakarta.servlet.http.HttpServletResponse

object Utils {
    fun getEmail(response: HttpServletResponse) =
        (
            response.getHeader(UserAuthorizationCheckFilter.EMAIL_HEADER)
                ?: throw BackendUsageException(
                    BackendUsageErrorCode.UNAUTHORIZED,
                    message = "Email not found. Rejecting request.",
                )
        )
}
