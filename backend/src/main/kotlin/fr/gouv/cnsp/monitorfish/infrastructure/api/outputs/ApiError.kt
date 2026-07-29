package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

data class ApiError(
    val error: String,
    val type: String,
) {
    constructor(exception: Throwable) : this(
        error = exception.message ?: "",
        type = exception::class.simpleName ?: exception::class.java.name,
    )
}
