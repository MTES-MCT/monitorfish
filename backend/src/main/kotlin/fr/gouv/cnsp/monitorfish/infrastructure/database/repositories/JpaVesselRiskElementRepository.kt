package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.risk_element.VesselRiskElement
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRiskElementRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBVesselRiskElementRepository
import org.springframework.stereotype.Repository

@Repository
class JpaVesselRiskElementRepository(
    private val dbVesselRiskElementRepository: DBVesselRiskElementRepository,
    private val mapper: ObjectMapper,
) : VesselRiskElementRepository {
    override fun findAllByCfr(cfr: String): List<VesselRiskElement> =
        dbVesselRiskElementRepository
            .findAllByIdCfr(cfr)
            .map { it.toVesselRiskElement(mapper) }
            .sortedBy { it.code }
}
