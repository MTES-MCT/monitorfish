package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSentMessage
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationSentMessageRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPriorNotificationSentMessageRepository
import org.springframework.stereotype.Repository

@Repository
class JpaPriorNotificationSentMessageRepository(
    private val dbPriorNotificationSentMessageRepository: DBPriorNotificationSentMessageRepository,
) : PriorNotificationSentMessageRepository {
    override fun findAllByReportId(reportId: String): List<PriorNotificationSentMessage> {
        return dbPriorNotificationSentMessageRepository
            .findAllByReportId(reportId)
            .map { it.toPriorNotificationSentMessage() }
    }
}
