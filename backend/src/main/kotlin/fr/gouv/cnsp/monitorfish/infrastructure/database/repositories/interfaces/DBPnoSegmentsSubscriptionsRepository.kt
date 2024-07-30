package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PnoSegmentSubscriptionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PnoSegmentSubscriptionId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DBPnoSegmentsSubscriptionsRepository : JpaRepository<PnoSegmentSubscriptionEntity, PnoSegmentSubscriptionId> {
    @Query(
        """
        SELECT COUNT(*)
        FROM pno_segments_subscriptions s
        JOIN pno_ports_subscriptions p ON p.control_unit_id = s.control_unit_id
        WHERE p.port_locode = :portLocode AND s.segment IN (:segmentCodes)
        """,
        nativeQuery = true,
    )
    fun countByPortLocodeAndSegmentCodes(portLocode: String, segmentCodes: List<String>): Long
}
