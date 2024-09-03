package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationDocument
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationUploadRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PriorNotificationUploadEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPriorNotificationUploadRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class JpaPriorNotificationUploadRepository(
    private val dbPriorNotificationUploadRepository: DBPriorNotificationUploadRepository,
) : PriorNotificationUploadRepository {
    override fun deleteById(id: String) {
        dbPriorNotificationUploadRepository.deleteById(id)
    }

    override fun findAllByReportId(reportId: String): List<PriorNotificationDocument> {
        return dbPriorNotificationUploadRepository.findByReportId(reportId).map { it.toDocument() }
    }

    override fun findById(id: String): PriorNotificationDocument {
        try {
            return dbPriorNotificationUploadRepository.findById(id).get().toDocument()
        } catch (e: Exception) {
            throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
        }
    }

    @Transactional
    override fun save(newPriorNotificationDocument: PriorNotificationDocument): PriorNotificationDocument {
        return dbPriorNotificationUploadRepository
            .save(PriorNotificationUploadEntity.fromDocument(newPriorNotificationDocument)).toDocument()
    }
}
