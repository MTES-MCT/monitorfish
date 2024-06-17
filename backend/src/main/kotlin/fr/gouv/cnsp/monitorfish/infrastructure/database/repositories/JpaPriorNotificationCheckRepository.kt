package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationCheck
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationCheckRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PriorNotificationCheckEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPriorNotificationCheckRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class JpaPriorNotificationCheckRepository(
    private val dbPriorNotificationCheckRepository: DBPriorNotificationCheckRepository,
) : PriorNotificationCheckRepository {
    override fun findByReportId(reportId: String): PriorNotificationCheck? {
        return dbPriorNotificationCheckRepository.findByReportId(reportId)?.toPriorNotificationCheck()
    }

    @Transactional
    override fun save(nextPriorNotificationCheck: PriorNotificationCheck): PriorNotificationCheck {
        return dbPriorNotificationCheckRepository
            .save(PriorNotificationCheckEntity.fromPriorNotificationCheck(nextPriorNotificationCheck, true))
            .toPriorNotificationCheck()
    }
}
