package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoPortSubscriptionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPnoPortsSubscriptionsRepository
import org.springframework.stereotype.Repository

@Repository
class JpaPnoPortSubscriptionRepository(
    private val dbPnoPortsSubscriptionsRepository: DBPnoPortsSubscriptionsRepository,
) : PnoPortSubscriptionRepository {
    override fun findByControlUnitId(controlUnitId: Int): List<PriorNotificationPortSubscription> {
        return dbPnoPortsSubscriptionsRepository.findByControlUnitId(controlUnitId)
            .map { it.toPriorNotificationPortSubscription() }
    }

    override fun has(portLocode: String): Boolean {
        return dbPnoPortsSubscriptionsRepository.countByPortLocode(portLocode) > 0
    }
}
