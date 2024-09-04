package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselAndBeacon
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository

@UseCase
class SearchVessels(
    private val vesselRepository: VesselRepository,
    private val beaconRepository: BeaconRepository,
) {
    fun execute(searched: String): List<VesselAndBeacon> {
        val vessels =
            vesselRepository.search(searched).filter {
                !(
                    it.internalReferenceNumber.isNullOrEmpty() &&
                        it.externalReferenceNumber.isNullOrEmpty() &&
                        it.ircs.isNullOrEmpty() &&
                        it.mmsi.isNullOrEmpty()
                )
            }.map { VesselAndBeacon(vessel = it) }

        val beacons = beaconRepository.search(searched)
        val beaconsVesselId = beacons.mapNotNull { it.vesselId }

        val vesselsFromBeacons =
            vesselRepository
                .findVesselsByIds(beaconsVesselId)
                .map { vessel ->
                    val beacon = beacons.find { beacon -> beacon.vesselId == vessel.id }

                    return@map VesselAndBeacon(vessel, beacon)
                }

        return (vesselsFromBeacons + vessels)
            .distinctBy { it.vessel.id }
    }
}
