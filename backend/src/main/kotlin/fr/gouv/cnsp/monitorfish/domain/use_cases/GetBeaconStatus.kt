package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatus.Companion.getVesselFromBeaconStatus
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusWithDetails
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusCommentsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import org.slf4j.LoggerFactory

@UseCase
class GetBeaconStatus(private val beaconStatusesRepository: BeaconStatusesRepository,
                      private val beaconStatusCommentsRepository: BeaconStatusCommentsRepository,
                      private val beaconStatusActionsRepository: BeaconStatusActionsRepository,
                      private val lastPositionRepository: LastPositionRepository) {
    private val logger = LoggerFactory.getLogger(GetAllBeaconStatuses::class.java)

    fun execute(beaconStatusId: Int): BeaconStatusWithDetails {
        val lastPositions = lastPositionRepository.findAll()
        val beaconStatus = beaconStatusesRepository.find(beaconStatusId)
        val comments = beaconStatusCommentsRepository.findAllByBeaconStatusId(beaconStatusId)
        val actions = beaconStatusActionsRepository.findAllByBeaconStatusId(beaconStatusId)

        val riskFactor = lastPositions.find(getVesselFromBeaconStatus(beaconStatus))?.riskFactor
        beaconStatus.riskFactor = riskFactor

        if (riskFactor == null) {
            logger.warn("No risk factor for vessel ${beaconStatus.internalReferenceNumber} found in last positions table")
        }

        return BeaconStatusWithDetails(
                beaconStatus = beaconStatus,
                comments = comments,
                actions = actions)
    }
}
