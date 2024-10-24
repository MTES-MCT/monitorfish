package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoPortSubscriptionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PnoPortSubscriptionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPnoPortsSubscriptionsRepository
import org.springframework.stereotype.Repository

@Repository
class JpaPnoPortSubscriptionRepository(
    private val dbPnoPortsSubscriptionsRepository: DBPnoPortsSubscriptionsRepository,
) : PnoPortSubscriptionRepository {
    override fun deleteByControlUnitId(controlUnitId: Int) {
        dbPnoPortsSubscriptionsRepository.deleteByControlUnitId(controlUnitId)
    }

    override fun findAll(): List<PriorNotificationPortSubscription> {
        return dbPnoPortsSubscriptionsRepository.findAll()
            .map { it.toPriorNotificationPortSubscription() }
    }

    override fun findByControlUnitId(controlUnitId: Int): List<PriorNotificationPortSubscription> {
        return dbPnoPortsSubscriptionsRepository.findByControlUnitId(controlUnitId)
            .map { it.toPriorNotificationPortSubscription() }
    }

    override fun has(portLocode: String): Boolean {
        return dbPnoPortsSubscriptionsRepository.countByPortLocode(portLocode) > 0
    }

    override fun saveAll(
        priorNotificationPortSubscriptions: List<PriorNotificationPortSubscription>,
    ): List<PriorNotificationPortSubscription> {
        return dbPnoPortsSubscriptionsRepository.saveAll(
            priorNotificationPortSubscriptions.map {
                PnoPortSubscriptionEntity.fromPriorNotificationPortSubscription(
                    it,
                )
            },
        )
            .map { it.toPriorNotificationPortSubscription() }
    }
}
