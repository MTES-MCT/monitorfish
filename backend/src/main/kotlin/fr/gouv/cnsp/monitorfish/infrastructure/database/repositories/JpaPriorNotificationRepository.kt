package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageTyped
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ManualPriorNotificationEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPriorNotificationRepository
import org.springframework.stereotype.Repository

@Repository
class JpaPriorNotificationRepository(private val dbPriorNotificationRepository: DBPriorNotificationRepository) :
    PriorNotificationRepository {
    override fun save(logbookMessageTyped: LogbookMessageTyped<PNO>): PriorNotification {
        return dbPriorNotificationRepository
            .save(ManualPriorNotificationEntity.fromLogbookMessageTyped(logbookMessageTyped))
            .toPriorNotification()
    }
}
