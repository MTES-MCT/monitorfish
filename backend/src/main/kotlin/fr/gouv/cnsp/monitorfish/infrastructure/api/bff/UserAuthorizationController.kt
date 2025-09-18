package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.UserAuthorizationDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.security.UserAuthorizationCheckFilter
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/authorization")
@Tag(name = "APIs for authorization")
class UserAuthorizationController(
    private val getAuthorizedUser: GetAuthorizedUser,
) {
    private val logger = LoggerFactory.getLogger(UserAuthorizationController::class.java)

    /**
     * This controller will
     *   - return 200 with the UserAuthorization object if the user authorization is found
     *     (it passes the filter `UserAuthorizationCheckFilter` - the endpoint is not super-user protected)
     *   - return an 200 with `isSuperUser=false` if the user authorization is not found
     */
    @GetMapping("current")
    @Operation(summary = "Get current logged user authorization")
    fun getCurrentUserAuthorization(
        request: HttpServletRequest,
        response: HttpServletResponse,
    ): UserAuthorizationDataOutput? {
        val email: String? = response.getHeader(UserAuthorizationCheckFilter.EMAIL_HEADER)
        if (email == null) {
            logger.error("Email not found. Rejecting authentication.")

            response.status = HttpServletResponse.SC_UNAUTHORIZED

            return null
        }

        val authorizedUser = getAuthorizedUser.execute(email)

        // The email is hashed as we don't want to have a clear email in the header
        response.setHeader(UserAuthorizationCheckFilter.EMAIL_HEADER, hash(email))

        return UserAuthorizationDataOutput.fromUserAuthorization(authorizedUser)
    }
}
