package fr.gouv.cnsp.monitorfish.domain.use_cases.user_feedback

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.user_feedback.UserFeedback
import fr.gouv.cnsp.monitorfish.domain.repositories.UserFeedbackRepository

@UseCase
class SendUserFeedback(
    private val userFeedbackRepository: UserFeedbackRepository,
) {
    fun execute(
        message: String,
        userEmail: String,
        pageUrl: String?,
    ) {
        val trimmedMessage = message.trim()
        require(trimmedMessage.isNotEmpty()) { "The feedback message is empty." }
        require(trimmedMessage.length <= MESSAGE_MAX_LENGTH) {
            "The feedback message exceeds $MESSAGE_MAX_LENGTH characters."
        }

        userFeedbackRepository.send(
            UserFeedback(message = trimmedMessage, userEmail = userEmail, pageUrl = pageUrl?.take(PAGE_URL_MAX_LENGTH)),
        )
    }

    companion object {
        const val MESSAGE_MAX_LENGTH = 2000
        private const val PAGE_URL_MAX_LENGTH = 500
    }
}
