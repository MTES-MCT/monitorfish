package fr.gouv.cnsp.monitorfish.domain.repositories

interface PnoSegmentSubscriptionRepository {
    fun has(
        portLocode: String,
        segmentCodes: List<String>,
    ): Boolean
}
