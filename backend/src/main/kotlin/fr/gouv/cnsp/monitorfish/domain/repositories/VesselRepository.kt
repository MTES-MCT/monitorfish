package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Vessel

interface VesselRepository {
    fun findVessel(internalReferenceNumber: String, externalReferenceNumber: String, IRCS: String): Vessel
    fun search(searched: String): List<Vessel>
}
