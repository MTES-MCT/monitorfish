package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PriorNotificationCheckEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DBPriorNotificationCheckRepository : JpaRepository<PriorNotificationCheckEntity, String> {
    @Query(
        """
        SELECT *
        FROM prior_notification_checks
        WHERE report_id = :reportId
        """,
        nativeQuery = true,
    )
    fun findByReportId(reportId: String): PriorNotificationCheckEntity?

    fun save(entity: PriorNotificationCheckEntity): PriorNotificationCheckEntity
}
