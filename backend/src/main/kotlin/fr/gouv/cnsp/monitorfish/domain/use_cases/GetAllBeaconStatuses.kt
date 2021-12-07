package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacons_status.BeaconStatus
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository

@UseCase
class GetAllBeaconStatuses(private val beaconStatusesRepository: BeaconStatusesRepository) {
    fun execute(): List<BeaconStatus> {
        return beaconStatusesRepository.findAll()
    }
}
