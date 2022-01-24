package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusWithDetails
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusCommentsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository

@UseCase
class GetBeaconStatus(private val beaconStatusesRepository: BeaconStatusesRepository,
                      private val beaconStatusCommentsRepository: BeaconStatusCommentsRepository,
                      private val beaconStatusActionsRepository: BeaconStatusActionsRepository) {
    fun execute(beaconStatusId: Int): BeaconStatusWithDetails {
        val beaconStatus = beaconStatusesRepository.find(beaconStatusId)
        val comments = beaconStatusCommentsRepository.findAllByBeaconStatusId(beaconStatusId)
        val actions = beaconStatusActionsRepository.findAllByBeaconStatusId(beaconStatusId)


        return BeaconStatusWithDetails(
                beaconStatus = beaconStatus,
                comments = comments,
                actions = actions)
    }
}
