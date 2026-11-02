package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.risk_element.VesselRiskElement

interface VesselRiskElementRepository {
    fun findAllByCfr(cfr: String): List<VesselRiskElement>
}
