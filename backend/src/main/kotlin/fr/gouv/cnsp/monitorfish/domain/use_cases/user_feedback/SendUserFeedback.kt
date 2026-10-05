package fr.gouv.cnsp.monitorfish.domain.use_cases.user_feedback

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.user_feedback.UserFeedback
import fr.gouv.cnsp.monitorfish.domain.entities.user_feedback.UserFeedbackAttachment
import fr.gouv.cnsp.monitorfish.domain.repositories.UserFeedbackRepository

@UseCase
class SendUserFeedback(
    private val userFeedbackRepository: UserFeedbackRepository,
) {
    fun execute(
        message: String,
        userEmail: String,
        pageUrl: String?,
        attachments: List<UserFeedbackAttachment> = listOf(),
    ) {
        val trimmedMessage = message.trim()
        require(trimmedMessage.isNotEmpty()) { "The feedback message is empty." }
        require(trimmedMessage.length <= MESSAGE_MAX_LENGTH) {
            "The feedback message exceeds $MESSAGE_MAX_LENGTH characters."
        }
        require(attachments.size <= ATTACHMENTS_MAX_COUNT) {
            "The feedback has more than $ATTACHMENTS_MAX_COUNT attachments."
        }
        attachments.forEach {
            require(it.mimeType in ATTACHMENT_MIME_TYPES) { "The feedback attachment must be an image." }
            require(it.content.isNotEmpty()) { "The feedback attachment is empty." }
            require(it.content.size <= ATTACHMENT_MAX_SIZE_IN_BYTES) {
                "The feedback attachment exceeds $ATTACHMENT_MAX_SIZE_IN_BYTES bytes."
            }
        }

        userFeedbackRepository.send(
            UserFeedback(
                message = trimmedMessage,
                userEmail = userEmail,
                pageUrl = pageUrl?.take(PAGE_URL_MAX_LENGTH),
                attachments = attachments,
            ),
        )
    }

    companion object {
        const val MESSAGE_MAX_LENGTH = 2000
        const val ATTACHMENTS_MAX_COUNT = 5
        const val ATTACHMENT_MAX_SIZE_IN_BYTES = 5 * 1024 * 1024
        val ATTACHMENT_MIME_TYPES = setOf("image/png", "image/jpeg", "image/webp")
        private const val PAGE_URL_MAX_LENGTH = 500
    }
}
