package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.BeaconStatusResumeAndHistory
import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusWithDetails
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusCommentsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository
import org.slf4j.LoggerFactory

@UseCase
class GetVesselBeaconStatuses(private val beaconStatusesRepository: BeaconStatusesRepository,
                              private val beaconStatusCommentsRepository: BeaconStatusCommentsRepository,
                              private val beaconStatusActionsRepository: BeaconStatusActionsRepository) {
    private val logger = LoggerFactory.getLogger(GetVesselBeaconStatuses::class.java)
    fun execute(internalReferenceNumber: String,
                externalReferenceNumber: String,
                ircs: String,
                vesselIdentifier: VesselIdentifier): BeaconStatusResumeAndHistory {
        val value = when (vesselIdentifier) {
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> internalReferenceNumber
            VesselIdentifier.IRCS -> ircs
            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER -> externalReferenceNumber
        }

        val history = beaconStatusesRepository.findAllByVesselIdentifierEquals(vesselIdentifier, value)

        val beaconStatusWithDetails = history.map {
            val comments = beaconStatusCommentsRepository.findAllByBeaconStatusId(it.id)
            val actions = beaconStatusActionsRepository.findAllByBeaconStatusId(it.id)

            BeaconStatusWithDetails(it, comments, actions)
        }

        return BeaconStatusResumeAndHistory(beaconStatusWithDetails)
    }
}
