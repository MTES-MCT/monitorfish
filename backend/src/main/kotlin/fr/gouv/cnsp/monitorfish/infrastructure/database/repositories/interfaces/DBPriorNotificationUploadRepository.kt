package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PriorNotificationUploadEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DBPriorNotificationUploadRepository : JpaRepository<PriorNotificationUploadEntity, String> {
    @Query(
        """
        SELECT *
        FROM prior_notification_uploads
        WHERE report_id = :reportId
        """,
        nativeQuery = true,
    )
    fun findByReportId(reportId: String): List<PriorNotificationUploadEntity>

    fun save(entity: PriorNotificationUploadEntity): PriorNotificationUploadEntity
}
