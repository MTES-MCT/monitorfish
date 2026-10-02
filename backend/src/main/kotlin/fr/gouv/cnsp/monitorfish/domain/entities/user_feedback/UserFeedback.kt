package fr.gouv.cnsp.monitorfish.domain.entities.user_feedback

data class UserFeedback(
    val message: String,
    val userEmail: String,
    val pageUrl: String?,
)
