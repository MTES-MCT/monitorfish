package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationDocument
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationUploadRepository

@UseCase
class GetPriorNotificationUpload(
    private val priorNotificationUploadRepository: PriorNotificationUploadRepository,
) {
    fun execute(priorNotificationUploadId: String): PriorNotificationDocument {
        return priorNotificationUploadRepository.findById(priorNotificationUploadId)
    }
}
