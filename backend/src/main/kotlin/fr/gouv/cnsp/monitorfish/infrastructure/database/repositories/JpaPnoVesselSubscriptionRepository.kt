package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoVesselSubscriptionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PnoVesselSubscriptionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPnoVesselsSubscriptionsRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Repository

@Repository
class JpaPnoVesselSubscriptionRepository(
    private val dbPnoVesselsSubscriptionsRepository: DBPnoVesselsSubscriptionsRepository,
) : PnoVesselSubscriptionRepository {
    @Transactional
    override fun deleteByControlUnitId(controlUnitId: Int) {
        dbPnoVesselsSubscriptionsRepository.deleteByControlUnitId(controlUnitId)
    }

    override fun findAll(): List<PriorNotificationVesselSubscription> =
        dbPnoVesselsSubscriptionsRepository
            .findAll()
            .map { it.toPriorNotificationVesselSubscription() }

    override fun findByControlUnitId(controlUnitId: Int): List<PriorNotificationVesselSubscription> =
        dbPnoVesselsSubscriptionsRepository
            .findByControlUnitId(controlUnitId)
            .map { it.toPriorNotificationVesselSubscription() }

    override fun has(vesselId: Int): Boolean = dbPnoVesselsSubscriptionsRepository.countByVesselId(vesselId) > 0

    @Transactional
    override fun saveAll(
        priorNotificationVesselSubscriptions: List<PriorNotificationVesselSubscription>,
    ): List<PriorNotificationVesselSubscription> =
        dbPnoVesselsSubscriptionsRepository
            .saveAll(
                priorNotificationVesselSubscriptions.map {
                    PnoVesselSubscriptionEntity.fromPriorNotificationVesselSubscription(
                        it,
                    )
                },
            ).map { it.toPriorNotificationVesselSubscription() }
}
