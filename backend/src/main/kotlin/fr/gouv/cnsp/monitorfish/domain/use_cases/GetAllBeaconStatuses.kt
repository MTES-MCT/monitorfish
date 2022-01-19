package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatus
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import org.slf4j.LoggerFactory

@UseCase
class GetAllBeaconStatuses(private val beaconStatusesRepository: BeaconStatusesRepository,
                           private val lastPositionRepository: LastPositionRepository) {
    private val logger = LoggerFactory.getLogger(GetAllBeaconStatuses::class.java)
    fun execute(): List<BeaconStatus> {
        val lastPositions = lastPositionRepository.findAll()

        return beaconStatusesRepository.findAll().map { beaconStatus ->
            val riskFactor = lastPositions.find { lastPosition ->
                lastPosition.internalReferenceNumber == beaconStatus.internalReferenceNumber
            }?.riskFactor
            beaconStatus.riskFactor = riskFactor

            if (riskFactor == null) {
                logger.warn("No risk factor for vessel ${beaconStatus.internalReferenceNumber} found in last positions table")
            }

            beaconStatus
        }
    }
}
