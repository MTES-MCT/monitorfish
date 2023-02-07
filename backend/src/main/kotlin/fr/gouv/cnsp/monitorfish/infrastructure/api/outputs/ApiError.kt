package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

class ApiError(val error: String, val type: String) {
    constructor(exception: Throwable) : this(
        exception.cause?.message
            ?: "",
        exception.cause?.javaClass?.simpleName.toString(),
    )
}
