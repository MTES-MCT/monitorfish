package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunction
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionResumeAndDetails
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionWithDetails
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.VesselBeaconMalfunctionsResume
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionCommentsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetBeaconMalfunction(private val beaconMalfunctionsRepository: BeaconMalfunctionsRepository,
                      private val beaconMalfunctionCommentsRepository: BeaconMalfunctionCommentsRepository,
                      private val beaconMalfunctionActionsRepository: BeaconMalfunctionActionsRepository,
                      private val lastPositionRepository: LastPositionRepository) {
    private val logger = LoggerFactory.getLogger(GetBeaconMalfunction::class.java)

    fun execute(beaconMalfunctionId: Int): BeaconMalfunctionResumeAndDetails {
        val lastPositions = lastPositionRepository.findAll()
        val beaconMalfunction = beaconMalfunctionsRepository.find(beaconMalfunctionId)
        val beaconMalfunctionComments = beaconMalfunctionCommentsRepository.findAllByBeaconMalfunctionId(beaconMalfunctionId)
        val beaconMalfunctionActions = beaconMalfunctionActionsRepository.findAllByBeaconMalfunctionId(beaconMalfunctionId)

        val riskFactor = lastPositions.find(BeaconMalfunction.getVesselFromBeaconMalfunction(beaconMalfunction))?.riskFactor
        beaconMalfunction.riskFactor = riskFactor

        if (riskFactor == null) {
            logger.warn("No risk factor for vessel ${beaconMalfunction.internalReferenceNumber} found in last positions table")
        }

        val vesselIdentifierValue = when (beaconMalfunction.vesselIdentifier) {
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> beaconMalfunction.internalReferenceNumber
            VesselIdentifier.IRCS -> beaconMalfunction.ircs
            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER -> beaconMalfunction.externalReferenceNumber
        }

        val vesselBeaconMalfunctionsResume = vesselIdentifierValue?.let {
            val oneYearBefore = ZonedDateTime.now().minusYears(1)
            val vesselBeaconMalfunctions = beaconMalfunctionsRepository.findAllByVesselIdentifierEquals(beaconMalfunction.vesselIdentifier, it, oneYearBefore)

            val beaconMalfunctionsWithDetails = vesselBeaconMalfunctions.map { beaconMalfunction ->
                val comments = beaconMalfunctionCommentsRepository.findAllByBeaconMalfunctionId(beaconMalfunction.id)
                val actions = beaconMalfunctionActionsRepository.findAllByBeaconMalfunctionId(beaconMalfunction.id)

                BeaconMalfunctionWithDetails(beaconMalfunction, comments, actions)
            }

            VesselBeaconMalfunctionsResume.fromBeaconMalfunctions(beaconMalfunctionsWithDetails)
        } ?: run {
            logger.warn("The vessel identifier '${beaconMalfunction.vesselIdentifier}' was not found in the beacon malfunctions : " +
                    "the vessel beacon malfunction resume could not be extracted")

            null
        }

        return BeaconMalfunctionResumeAndDetails(
                beaconMalfunction = beaconMalfunction,
                resume = vesselBeaconMalfunctionsResume,
                comments = beaconMalfunctionComments,
                actions = beaconMalfunctionActions)
    }
}
