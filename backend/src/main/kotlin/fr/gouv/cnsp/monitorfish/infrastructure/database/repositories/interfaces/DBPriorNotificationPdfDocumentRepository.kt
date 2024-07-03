package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PriorNotificationPdfDocumentEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBPriorNotificationPdfDocumentRepository : CrudRepository<PriorNotificationPdfDocumentEntity, String> {
    @Query
    fun findByReportId(reportId: String): PriorNotificationPdfDocumentEntity
}
