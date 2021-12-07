package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacons_status.BeaconStatus
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository

@UseCase
class GetBeaconStatuses(private val beaconStatusesRepository: BeaconStatusesRepository) {
    fun execute(): List<BeaconStatus> {
        return beaconStatusesRepository.findAll()
    }
}
