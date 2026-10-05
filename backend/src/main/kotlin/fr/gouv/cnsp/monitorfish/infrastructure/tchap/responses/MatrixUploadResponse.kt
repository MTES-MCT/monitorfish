package fr.gouv.cnsp.monitorfish.infrastructure.tchap.responses

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class MatrixUploadResponse(
    @SerialName("content_uri")
    val contentUri: String,
)
