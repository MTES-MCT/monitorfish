package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.repositories.PnoSegmentSubscriptionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPnoSegmentsSubscriptionsRepository
import org.springframework.stereotype.Repository

@Repository
class JpaPnoSegmentSubscriptionRepository(
    private val dbPnoSegmentsSubscriptionsRepository: DBPnoSegmentsSubscriptionsRepository,
) : PnoSegmentSubscriptionRepository {
    override fun has(
        portLocode: String,
        segmentCodes: List<String>,
    ): Boolean {
        return dbPnoSegmentsSubscriptionsRepository.countByPortLocodeAndSegmentCodes(portLocode, segmentCodes) > 0
    }
}
