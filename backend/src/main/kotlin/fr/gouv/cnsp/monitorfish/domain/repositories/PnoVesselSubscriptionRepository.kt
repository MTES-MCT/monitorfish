package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription

interface PnoVesselSubscriptionRepository {
    fun deleteByControlUnitId(controlUnitId: Int)

    fun findAll(): List<PriorNotificationVesselSubscription>

    fun findByControlUnitId(controlUnitId: Int): List<PriorNotificationVesselSubscription>

    fun has(vesselId: Int): Boolean

    fun saveAll(
        priorNotificationVesselSubscriptions: List<PriorNotificationVesselSubscription>,
    ): List<PriorNotificationVesselSubscription>
}
