package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.user_feedback.UserFeedbackAttachment
import java.util.Base64

data class UserFeedbackFileDataInput(
    val content: String,
    val mimeType: String,
    val name: String,
) {
    fun toUserFeedbackAttachment() =
        UserFeedbackAttachment(
            content = Base64.getDecoder().decode(content),
            fileName = name,
            mimeType = mimeType,
        )
}
