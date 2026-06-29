package fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository

@UseCase
class UpdateBeaconMalfunctionIsFollowed(
    private val beaconMalfunctionsRepository: BeaconMalfunctionsRepository,
) {
    fun execute(id: Int, isFollowed: Boolean) {
        beaconMalfunctionsRepository.updateIsFollowed(id, isFollowed)
    }
}
