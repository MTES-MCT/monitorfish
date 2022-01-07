package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselStatus
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotUpdateBeaconStatusException
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository
import java.time.ZonedDateTime

@UseCase
class UpdateBeaconStatus(private val beaconStatusesRepository: BeaconStatusesRepository) {
    @Throws(CouldNotUpdateBeaconStatusException::class, IllegalArgumentException::class)
    fun execute(id: Int, vesselStatus: VesselStatus?, stage: Stage?) {
        require(vesselStatus != null || stage != null) {
            "No value to update"
        }
        val updateDateTime = ZonedDateTime.now()

        beaconStatusesRepository.update(id, vesselStatus, stage, updateDateTime)
    }
}
