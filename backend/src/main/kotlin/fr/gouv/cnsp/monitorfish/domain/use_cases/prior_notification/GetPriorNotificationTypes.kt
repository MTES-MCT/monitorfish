package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.*

@UseCase
class GetPriorNotificationTypes(
    private val logbookReportRepository: JpaLogbookReportRepository,
) {
    fun execute(): List<String> {
        return logbookReportRepository.findDistinctPriorNotificationTypes()
    }
}
