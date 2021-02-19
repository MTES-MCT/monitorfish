package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.rules.Rule
import fr.gouv.cnsp.monitorfish.domain.repositories.AlertRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RuleRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AlertEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBAlertRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBRuleRepository
import org.springframework.stereotype.Repository

@Repository
class JpaAlertRepository(private val dbAlertRepository: DBAlertRepository,
                         private val mapper: ObjectMapper) : AlertRepository {

    override fun save(alert: Alert) {
        dbAlertRepository.save(AlertEntity.fromAlert(alert, mapper))
    }

}
