package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.repositories.PnoVesselSubscriptionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPnoVesselsSubscriptionsRepository
import org.springframework.stereotype.Repository

@Repository
class JpaPnoVesselSubscriptionRepository(
    private val dbPnoVesselsSubscriptionsRepository: DBPnoVesselsSubscriptionsRepository,
) : PnoVesselSubscriptionRepository {
    override fun has(vesselId: Int): Boolean {
        return dbPnoVesselsSubscriptionsRepository.countByVesselId(vesselId) > 0
    }
}
