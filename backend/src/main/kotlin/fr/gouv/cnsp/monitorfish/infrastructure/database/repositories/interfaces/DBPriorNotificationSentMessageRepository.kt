package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PriorNotificationSentMessageEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DBPriorNotificationSentMessageRepository : JpaRepository<PriorNotificationSentMessageEntity, String> {
    @Query(
        """
        SELECT *
        FROM prior_notification_sent_messages
        WHERE prior_notification_report_id = :reportId
        """,
        nativeQuery = true,
    )
    fun findAllByReportId(reportId: String): List<PriorNotificationSentMessageEntity>
}
