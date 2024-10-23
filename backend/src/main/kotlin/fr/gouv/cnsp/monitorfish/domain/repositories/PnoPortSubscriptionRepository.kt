package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription

interface PnoPortSubscriptionRepository {
    fun findAll(): List<PriorNotificationPortSubscription>

    fun findByControlUnitId(controlUnitId: Int): List<PriorNotificationPortSubscription>

    fun has(portLocode: String): Boolean
}
