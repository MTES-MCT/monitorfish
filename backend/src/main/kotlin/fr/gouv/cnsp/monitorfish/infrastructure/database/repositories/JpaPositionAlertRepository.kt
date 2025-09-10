package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlert
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPositionAlertRepository
import org.springframework.stereotype.Repository

@Repository
class JpaPositionAlertRepository(
    private val dbPositionAlertRepository: DBPositionAlertRepository,
    private val mapper: ObjectMapper,
) : PositionAlertRepository {
    override fun findAllByIsDeletedIsFalse(): List<PositionAlert> =
        dbPositionAlertRepository
            .findAllByIsDeletedIsFalse()
            .map { it.toPositionAlert(mapper) }
}
