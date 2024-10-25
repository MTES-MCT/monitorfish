package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationFleetSegmentSubscription

interface PnoFleetSegmentSubscriptionRepository {
    fun deleteByControlUnitId(controlUnitId: Int)

    fun findAll(): List<PriorNotificationFleetSegmentSubscription>

    fun findByControlUnitId(controlUnitId: Int): List<PriorNotificationFleetSegmentSubscription>

    fun has(
        portLocode: String,
        segmentCodes: List<String>,
    ): Boolean

    fun saveAll(
        priorNotificationFleetSegmentSubscriptions: List<PriorNotificationFleetSegmentSubscription>,
    ): List<PriorNotificationFleetSegmentSubscription>
}
