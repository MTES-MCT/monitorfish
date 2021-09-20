package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselControlAnteriority

interface ControlAnteriorityRepository {
    fun findVesselControlAnteriority(internalReferenceNumber: String): VesselControlAnteriority?
}