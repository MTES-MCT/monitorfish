package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoVesselSubscriptionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPnoVesselsSubscriptionsRepository
import org.springframework.stereotype.Repository

@Repository
class JpaPnoVesselSubscriptionRepository(
    private val dbPnoVesselsSubscriptionsRepository: DBPnoVesselsSubscriptionsRepository,
) : PnoVesselSubscriptionRepository {
    override fun findAll(): List<PriorNotificationVesselSubscription> {
        return dbPnoVesselsSubscriptionsRepository.findAll()
            .map { it.toPriorNotificationVesselSubscription() }
    }

    override fun findByControlUnitId(controlUnitId: Int): List<PriorNotificationVesselSubscription> {
        return dbPnoVesselsSubscriptionsRepository.findByControlUnitId(controlUnitId)
            .map { it.toPriorNotificationVesselSubscription() }
    }

    override fun has(vesselId: Int): Boolean {
        return dbPnoVesselsSubscriptionsRepository.countByVesselId(vesselId) > 0
    }
}
