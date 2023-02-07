package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.SilencedAlertEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBSilencedAlertRepository
import org.springframework.stereotype.Repository
import java.time.ZonedDateTime

@Repository
class JpaSilencedAlertRepository(
    private val dbSilencedAlertRepository: DBSilencedAlertRepository,
    private val mapper: ObjectMapper,
) : SilencedAlertRepository {

    override fun save(
        alert: PendingAlert,
        silencedBeforeDate: ZonedDateTime,
        isValidated: Boolean,
    ): SilencedAlert {
        return dbSilencedAlertRepository.save(
            SilencedAlertEntity.fromPendingAlert(mapper, alert, silencedBeforeDate, isValidated),
        ).toSilencedAlert(mapper)
    }

    override fun findAllCurrentSilencedAlerts(): List<SilencedAlert> {
        val now = ZonedDateTime.now()
        return dbSilencedAlertRepository.findAllBySilencedBeforeDateAfter(now).map { it.toSilencedAlert(mapper) }
    }

    override fun delete(id: Int) {
        dbSilencedAlertRepository.deleteById(id)
    }
}
