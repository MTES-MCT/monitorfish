package fr.gouv.cnsp.monitorfish.domain.entities.user_feedback

class UserFeedbackAttachment(
    val content: ByteArray,
    val fileName: String,
    val mimeType: String,
)
