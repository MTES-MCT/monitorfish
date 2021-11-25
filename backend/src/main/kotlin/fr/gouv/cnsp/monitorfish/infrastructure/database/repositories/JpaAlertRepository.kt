package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.repositories.AlertRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AlertEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBAlertRepository
import org.springframework.stereotype.Repository

@Repository
class JpaAlertRepository(private val dbAlertRepository: DBAlertRepository,
                         private val mapper: ObjectMapper) : AlertRepository {

    override fun save(alert: Alert) {
        dbAlertRepository.save(AlertEntity.fromAlert(alert, mapper))
    }

    override fun findAlertsOfTypes(types: List<AlertTypeMapping>, internalReferenceNumber: String, tripNumber: Int): List<Alert> {
        val rulesAsString = types.map { it.name }

        return dbAlertRepository.findAlertsOfRules(rulesAsString, internalReferenceNumber, tripNumber)
                .map { it.toAlert(mapper) }
    }

    override fun findAlertsOfTypes(types: List<AlertTypeMapping>): List<Alert> {
        val rulesAsString = types.map { it.name }

        return dbAlertRepository.findAlertsOfRules(rulesAsString)
                .map { it.toAlert(mapper) }
    }
}
