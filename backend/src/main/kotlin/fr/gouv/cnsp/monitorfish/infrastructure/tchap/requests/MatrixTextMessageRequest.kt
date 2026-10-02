package fr.gouv.cnsp.monitorfish.infrastructure.tchap.requests

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class MatrixTextMessageRequest(
    val msgtype: String,
    val body: String,
    val format: String,
    @SerialName("formatted_body")
    val formattedBody: String,
)
