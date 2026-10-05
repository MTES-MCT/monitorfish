package fr.gouv.cnsp.monitorfish.infrastructure.tchap.requests

import kotlinx.serialization.Serializable

@Serializable
data class MatrixImageMessageRequest(
    val msgtype: String,
    val body: String,
    val url: String,
    val info: MatrixImageInfo,
)

@Serializable
data class MatrixImageInfo(
    val mimetype: String,
    val size: Int,
)
