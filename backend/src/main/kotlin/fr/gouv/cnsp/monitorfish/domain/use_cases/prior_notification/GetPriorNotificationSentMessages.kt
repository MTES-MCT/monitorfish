package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSentMessage
import fr.gouv.cnsp.monitorfish.domain.repositories.*

@UseCase
class GetPriorNotificationSentMessages(
    private val priorNotificationSentMessageRepository: PriorNotificationSentMessageRepository,
) {
    fun execute(reportId: String): List<PriorNotificationSentMessage> =
        priorNotificationSentMessageRepository.findAllByReportId(reportId)
}
