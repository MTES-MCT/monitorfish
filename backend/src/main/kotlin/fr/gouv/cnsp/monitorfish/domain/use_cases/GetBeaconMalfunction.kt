package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunction.Companion.getVesselFromBeaconMalfunction
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionWithDetails
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionCommentsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import org.slf4j.LoggerFactory

@UseCase
class GetBeaconMalfunction(private val beaconMalfunctionsRepository: BeaconMalfunctionsRepository,
                           private val beaconMalfunctionCommentsRepository: BeaconMalfunctionCommentsRepository,
                           private val beaconMalfunctionActionsRepository: BeaconMalfunctionActionsRepository,
                           private val lastPositionRepository: LastPositionRepository) {
    private val logger = LoggerFactory.getLogger(GetAllBeaconMalfunctions::class.java)

    fun execute(beaconMalfunctionId: Int): BeaconMalfunctionWithDetails {
        val lastPositions = lastPositionRepository.findAll()
        val beaconMalfunction = beaconMalfunctionsRepository.find(beaconMalfunctionId)
        val comments = beaconMalfunctionCommentsRepository.findAllByBeaconMalfunctionId(beaconMalfunctionId)
        val actions = beaconMalfunctionActionsRepository.findAllByBeaconMalfunctionId(beaconMalfunctionId)

        val riskFactor = lastPositions.find(getVesselFromBeaconMalfunction(beaconMalfunction))?.riskFactor
        beaconMalfunction.riskFactor = riskFactor

        if (riskFactor == null) {
            logger.warn("No risk factor for vessel ${beaconMalfunction.internalReferenceNumber} found in last positions table")
        }

        return BeaconMalfunctionWithDetails(
                beaconMalfunction = beaconMalfunction,
                comments = comments,
                actions = actions)
    }
}
