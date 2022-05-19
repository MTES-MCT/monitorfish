package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.SilencedAlertEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBSilencedAlertRepository
import org.springframework.stereotype.Repository
import java.time.ZonedDateTime

@Repository
class JpaSilencedAlertRepository(private val dbSilencedAlertRepository: DBSilencedAlertRepository) : SilencedAlertRepository {

    override fun save(alert: PendingAlert,
                      silencedBeforeDate: ZonedDateTime,
                      silencedAfterDate: ZonedDateTime?) {
        dbSilencedAlertRepository.save(SilencedAlertEntity.fromPendingAlert(alert, silencedBeforeDate, silencedAfterDate))
    }

    override fun findAll(): List<SilencedAlert> {
        return dbSilencedAlertRepository.findAll().map { it.toSilencedAlert() }
    }
}
