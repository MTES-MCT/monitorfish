package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PdfDocument
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationPdfDocumentRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPriorNotificationPdfDocumentRepository
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaPriorNotificationPdfDocumentRepository(
    private val dbPriorNotificationPdfDocumentRepository: DBPriorNotificationPdfDocumentRepository,
) : PriorNotificationPdfDocumentRepository {
    override fun findByReportId(reportId: String): PdfDocument {
        return try {
            dbPriorNotificationPdfDocumentRepository.findByReportId(reportId).toPdfDocument()
        } catch (e: EmptyResultDataAccessException) {
            throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
        }
    }
}
