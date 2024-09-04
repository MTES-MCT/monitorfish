package fr.gouv.cnsp.monitorfish.domain.repositories

interface MetricsRepository {
    fun sendMissingCodeWarning(
        codeType: String,
        code: String,
    )
}
