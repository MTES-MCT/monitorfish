package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatus.Companion.getVesselFromBeaconStatus
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusResumeAndDetails
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusWithDetails
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselBeaconMalfunctionsResume
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusCommentsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetBeaconStatus(private val beaconStatusesRepository: BeaconStatusesRepository,
                      private val beaconStatusCommentsRepository: BeaconStatusCommentsRepository,
                      private val beaconStatusActionsRepository: BeaconStatusActionsRepository,
                      private val lastPositionRepository: LastPositionRepository) {
    private val logger = LoggerFactory.getLogger(GetAllBeaconStatuses::class.java)

    fun execute(beaconStatusId: Int): BeaconStatusResumeAndDetails {
        val lastPositions = lastPositionRepository.findAll()
        val beaconStatus = beaconStatusesRepository.find(beaconStatusId)
        val beaconStatusComments = beaconStatusCommentsRepository.findAllByBeaconStatusId(beaconStatusId)
        val beaconStatusActions = beaconStatusActionsRepository.findAllByBeaconStatusId(beaconStatusId)

        val riskFactor = lastPositions.find(getVesselFromBeaconStatus(beaconStatus))?.riskFactor
        beaconStatus.riskFactor = riskFactor

        if (riskFactor == null) {
            logger.warn("No risk factor for vessel ${beaconStatus.internalReferenceNumber} found in last positions table")
        }

        val vesselIdentifierValue = when (beaconStatus.vesselIdentifier) {
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> beaconStatus.internalReferenceNumber
            VesselIdentifier.IRCS -> beaconStatus.ircs
            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER -> beaconStatus.externalReferenceNumber
        }

        val vesselBeaconStatusesResume = vesselIdentifierValue?.let {
            val oneYearBefore = ZonedDateTime.now().minusYears(1)
            val vesselBeaconStatuses = beaconStatusesRepository.findAllByVesselIdentifierEquals(beaconStatus.vesselIdentifier, it, oneYearBefore)

            val beaconStatusesWithDetails = vesselBeaconStatuses.map { beaconStatus ->
                val comments = beaconStatusCommentsRepository.findAllByBeaconStatusId(beaconStatus.id)
                val actions = beaconStatusActionsRepository.findAllByBeaconStatusId(beaconStatus.id)

                BeaconStatusWithDetails(beaconStatus, comments, actions)
            }

            VesselBeaconMalfunctionsResume.fromBeaconStatuses(beaconStatusesWithDetails)
        } ?: run {
            logger.warn("The vessel identifier '${beaconStatus.vesselIdentifier}' was not found in the beacon status : " +
                    "the vessel beacon statuses resume could not be extracted")

            null
        }

        return BeaconStatusResumeAndDetails(
                beaconStatus = beaconStatus,
                resume = vesselBeaconStatusesResume,
                comments = beaconStatusComments,
                actions = beaconStatusActions)
    }
}
