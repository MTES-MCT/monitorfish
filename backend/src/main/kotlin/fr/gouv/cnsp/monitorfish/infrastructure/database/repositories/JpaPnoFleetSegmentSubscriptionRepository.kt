package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationFleetSegmentSubscription
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoFleetSegmentSubscriptionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PnoFleetSegmentSubscriptionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPnoFleetSegmentsSubscriptionsRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Repository

@Repository
class JpaPnoFleetSegmentSubscriptionRepository(
    private val dbPnoFleetSegmentsSubscriptionsRepository: DBPnoFleetSegmentsSubscriptionsRepository,
) : PnoFleetSegmentSubscriptionRepository {
    @Transactional
    override fun deleteByControlUnitId(controlUnitId: Int) {
        dbPnoFleetSegmentsSubscriptionsRepository.deleteByControlUnitId(controlUnitId)
    }

    override fun findAll(): List<PriorNotificationFleetSegmentSubscription> {
        return dbPnoFleetSegmentsSubscriptionsRepository.findAll()
            .map { it.toPriorNotificationFleetSegmentSubscription() }
    }

    override fun findByControlUnitId(controlUnitId: Int): List<PriorNotificationFleetSegmentSubscription> {
        return dbPnoFleetSegmentsSubscriptionsRepository.findByControlUnitId(controlUnitId)
            .map { it.toPriorNotificationFleetSegmentSubscription() }
    }

    override fun has(
        portLocode: String,
        segmentCodes: List<String>,
    ): Boolean {
        return dbPnoFleetSegmentsSubscriptionsRepository.countByPortLocodeAndSegmentCodes(portLocode, segmentCodes) > 0
    }

    @Transactional
    override fun saveAll(
        priorNotificationFleetSegmentSubscriptions: List<PriorNotificationFleetSegmentSubscription>,
    ): List<PriorNotificationFleetSegmentSubscription> {
        return dbPnoFleetSegmentsSubscriptionsRepository.saveAll(
            priorNotificationFleetSegmentSubscriptions.map {
                PnoFleetSegmentSubscriptionEntity.fromPriorNotificationFleetSegmentSubscription(
                    it,
                )
            },
        )
            .map { it.toPriorNotificationFleetSegmentSubscription() }
    }
}
