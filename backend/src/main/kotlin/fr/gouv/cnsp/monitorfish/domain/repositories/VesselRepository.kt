package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel

interface VesselRepository {
    fun findAll(): List<Vessel>

    fun findVessel(
        internalReferenceNumber: String? = null,
        externalReferenceNumber: String? = null,
        ircs: String? = null,
    ): Vessel?

    fun findVesselsByIds(ids: List<Int>): List<Vessel>

    fun findVesselById(vesselId: Int): Vessel?

    fun search(searched: String): List<Vessel>
}
