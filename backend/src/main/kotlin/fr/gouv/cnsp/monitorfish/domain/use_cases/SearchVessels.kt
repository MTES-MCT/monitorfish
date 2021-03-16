package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository

@UseCase
class SearchVessels(private val vesselRepository: VesselRepository) {
    fun execute(searched: String): List<Vessel> {
        return vesselRepository.search(searched).filter {
            !(it.internalReferenceNumber.isNullOrEmpty() &&
                    it.externalReferenceNumber.isNullOrEmpty() &&
                    it.ircs.isNullOrEmpty() &&
                    it.mmsi.isNullOrEmpty())
        }
    }
}
