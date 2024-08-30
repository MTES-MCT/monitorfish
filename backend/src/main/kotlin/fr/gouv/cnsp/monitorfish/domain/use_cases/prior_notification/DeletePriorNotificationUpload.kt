package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationUploadRepository

@UseCase
class DeletePriorNotificationUpload(
    private val priorNotificationUploadRepository: PriorNotificationUploadRepository,
) {
    fun execute(priorNotificationUploadId: String) {
        priorNotificationUploadRepository.deleteById(priorNotificationUploadId)
    }
}
