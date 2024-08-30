package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationDocument
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationUploadRepository
import fr.gouv.cnsp.monitorfish.infrastructure.exceptions.BackendRequestErrorCode
import fr.gouv.cnsp.monitorfish.infrastructure.exceptions.BackendRequestException
import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime
import org.springframework.web.multipart.MultipartFile

@UseCase
class CreatePriorNotificationUpload(
    private val priorNotificationUploadRepository: PriorNotificationUploadRepository,
) {
    fun execute(reportId: String, isManualPriorNotification: Boolean, file: MultipartFile) {
        val createdAt = CustomZonedDateTime.now()
        val fileName = file.originalFilename
            ?: throw BackendRequestException(BackendRequestErrorCode.MISSING_UPLOADED_FILE_NAME)
        val mimeType = file.contentType
            ?: throw BackendRequestException(BackendRequestErrorCode.MISSING_UPLOADED_FILE_TYPE)

        val newPriorNotificationDocument = PriorNotificationDocument(
            id = null,
            content = file.bytes,
            createdAt = createdAt,
            fileName = fileName,
            isManualPriorNotification = isManualPriorNotification,
            mimeType = mimeType,
            reportId = reportId,
            updatedAt = createdAt,
        )

        priorNotificationUploadRepository.save(newPriorNotificationDocument)
    }
}
