package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSegmentSubscription

interface PnoSegmentSubscriptionRepository {
    fun findByControlUnitId(controlUnitId: Int): List<PriorNotificationSegmentSubscription>

    fun has(
        portLocode: String,
        segmentCodes: List<String>,
    ): Boolean
}
