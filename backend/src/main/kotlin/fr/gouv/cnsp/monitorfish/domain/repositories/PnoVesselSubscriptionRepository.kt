package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription

interface PnoVesselSubscriptionRepository {
    fun findByControlUnitId(controlUnitId: Int): List<PriorNotificationVesselSubscription>

    fun has(vesselId: Int): Boolean
}
