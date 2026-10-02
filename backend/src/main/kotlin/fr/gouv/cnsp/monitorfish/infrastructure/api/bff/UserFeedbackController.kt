package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.user_feedback.SendUserFeedback
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UserFeedbackDataInput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/user_feedback")
@Tag(name = "APIs for user feedback")
class UserFeedbackController(
    private val sendUserFeedback: SendUserFeedback,
) {
    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Send a user feedback to the MonitorFish team")
    fun sendUserFeedback(
        @AuthenticationPrincipal principal: OidcUser?,
        @RequestBody userFeedback: UserFeedbackDataInput,
    ) {
        val email: String = principal?.email ?: ""

        sendUserFeedback.execute(userFeedback.message, email, userFeedback.pageUrl)
    }
}
