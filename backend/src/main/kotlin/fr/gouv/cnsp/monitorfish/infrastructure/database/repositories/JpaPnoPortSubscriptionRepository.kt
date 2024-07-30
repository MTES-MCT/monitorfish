package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.repositories.PnoPortSubscriptionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPnoPortsSubscriptionsRepository
import org.springframework.stereotype.Repository

@Repository
class JpaPnoPortSubscriptionRepository(
    private val dbPnoPortsSubscriptionsRepository: DBPnoPortsSubscriptionsRepository,
) : PnoPortSubscriptionRepository {
    override fun has(portLocode: String): Boolean {
        return dbPnoPortsSubscriptionsRepository.countByPortLocode(portLocode) > 0
    }
}
