package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSegmentSubscription

interface PnoSegmentSubscriptionRepository {
    fun deleteByControlUnitId(controlUnitId: Int)

    fun findAll(): List<PriorNotificationSegmentSubscription>

    fun findByControlUnitId(controlUnitId: Int): List<PriorNotificationSegmentSubscription>

    fun has(
        portLocode: String,
        segmentCodes: List<String>,
    ): Boolean

    fun saveAll(
        priorNotificationSegmentSubscriptions: List<PriorNotificationSegmentSubscription>,
    ): List<PriorNotificationSegmentSubscription>
}
