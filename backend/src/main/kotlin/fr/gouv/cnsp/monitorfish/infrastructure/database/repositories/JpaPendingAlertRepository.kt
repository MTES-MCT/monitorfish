package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PendingAlertEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPendingAlertRepository
import org.springframework.stereotype.Repository

@Repository
class JpaPendingAlertRepository(
    private val dbPendingAlertRepository: DBPendingAlertRepository,
    private val mapper: ObjectMapper,
) : PendingAlertRepository {

    override fun save(alert: PendingAlert) {
        dbPendingAlertRepository.save(PendingAlertEntity.fromPendingAlert(alert, mapper))
    }

    override fun findAlertsOfTypes(types: List<AlertTypeMapping>): List<PendingAlert> {
        val rulesAsString = types.map { it.name }

        return dbPendingAlertRepository.findAlertsOfRules(rulesAsString)
            .map { it.toPendingAlert(mapper) }
    }

    override fun find(id: Int): PendingAlert {
        return dbPendingAlertRepository.findById(id).get()
            .toPendingAlert(mapper)
    }

    override fun delete(id: Int) {
        dbPendingAlertRepository.deleteById(id)
    }
}
