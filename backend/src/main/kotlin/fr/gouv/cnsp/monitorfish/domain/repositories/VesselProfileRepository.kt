package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile.VesselProfile

interface VesselProfileRepository {
    fun findByCfr(cfr: String): VesselProfile?
}
