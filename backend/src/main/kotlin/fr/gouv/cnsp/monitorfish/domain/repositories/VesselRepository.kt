package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel

interface VesselRepository {
  fun findVessel(internalReferenceNumber: String, externalReferenceNumber: String, ircs: String): Vessel
  fun search(searched: String): List<Vessel>
}
