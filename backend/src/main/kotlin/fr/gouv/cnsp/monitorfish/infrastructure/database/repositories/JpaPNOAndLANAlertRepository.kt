package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PNOAndLANAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.repositories.PNOAndLANAlertRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PnoAndLanAlertEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPNOAndLANAlertRepository
import org.springframework.stereotype.Repository

@Repository
class JpaPNOAndLANAlertRepository(
    private val dbPNOAndLANAlertRepository: DBPNOAndLANAlertRepository,
    private val mapper: ObjectMapper
) : PNOAndLANAlertRepository {

    override fun save(alert: PNOAndLANAlert) {
        val alertEntity = PnoAndLanAlertEntity.fromAlert(alert, mapper)

        dbPNOAndLANAlertRepository.save(
            alertEntity.id,
            alertEntity.internalReferenceNumber,
            alertEntity.externalReferenceNumber,
            alertEntity.ircs,
            alertEntity.creationDate,
            alertEntity.tripNumber,
            alertEntity.value
        )
    }

    override fun findAlertsOfTypes(types: List<AlertTypeMapping>, internalReferenceNumber: String, tripNumber: String): List<PNOAndLANAlert> {
        val rulesAsString = types.map { it.name }

        return dbPNOAndLANAlertRepository.findAlertsOfRules(rulesAsString, internalReferenceNumber, tripNumber)
            .map { it.toAlert(mapper) }
    }
}
