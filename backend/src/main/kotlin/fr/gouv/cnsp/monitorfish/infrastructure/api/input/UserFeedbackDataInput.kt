package fr.gouv.cnsp.monitorfish.infrastructure.api.input

data class UserFeedbackDataInput(
    val message: String,
    val pageUrl: String?,
    val files: List<UserFeedbackFileDataInput> = listOf(),
)
