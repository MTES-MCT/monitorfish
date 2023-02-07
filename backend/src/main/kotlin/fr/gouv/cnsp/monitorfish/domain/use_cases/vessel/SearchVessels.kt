package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository

@UseCase
class SearchVessels(
    private val vesselRepository: VesselRepository,
    private val beaconRepository: BeaconRepository,
) {
    fun execute(searched: String): List<Vessel> {
        val vessels = vesselRepository.search(searched).filter {
            !(
                it.internalReferenceNumber.isNullOrEmpty() &&
                    it.externalReferenceNumber.isNullOrEmpty() &&
                    it.ircs.isNullOrEmpty() &&
                    it.mmsi.isNullOrEmpty() &&
                    it.beaconNumber.isNullOrEmpty()
                )
        }

        val vesselIdsFromBeacons = beaconRepository.search(searched).mapNotNull { it.vesselId }
        val vesselsFromBeacons = vesselRepository.findVesselsByIds(vesselIdsFromBeacons)

        return (vessels + vesselsFromBeacons)
            .distinctBy { it.id }
    }
}
