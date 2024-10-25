package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PnoFleetSegmentSubscriptionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PnoFleetSegmentSubscriptionId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface DBPnoFleetSegmentsSubscriptionsRepository :
    JpaRepository<PnoFleetSegmentSubscriptionEntity, PnoFleetSegmentSubscriptionId> {
    @Query(
        """
        SELECT COUNT(*)
        FROM pno_segments_subscriptions s
        JOIN pno_ports_subscriptions p ON p.control_unit_id = s.control_unit_id
        WHERE p.port_locode = :portLocode AND s.segment IN (:segmentCodes)
        """,
        nativeQuery = true,
    )
    fun countByPortLocodeAndSegmentCodes(
        portLocode: String,
        segmentCodes: List<String>,
    ): Long

    @Modifying
    @Query("DELETE FROM pno_segments_subscriptions WHERE control_unit_id = :controlUnitId", nativeQuery = true)
    fun deleteByControlUnitId(controlUnitId: Int)

    @Query("SELECT * FROM pno_segments_subscriptions WHERE control_unit_id = :controlUnitId", nativeQuery = true)
    fun findByControlUnitId(controlUnitId: Int): List<PnoFleetSegmentSubscriptionEntity>
}
