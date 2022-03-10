package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionCommentsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselBeaconMalfunctions(private val beaconMalfunctionsRepository: BeaconMalfunctionsRepository,
                                  private val beaconMalfunctionCommentsRepository: BeaconMalfunctionCommentsRepository,
                                  private val beaconMalfunctionActionsRepository: BeaconMalfunctionActionsRepository) {
    private val logger = LoggerFactory.getLogger(GetVesselBeaconMalfunctions::class.java)
    fun execute(internalReferenceNumber: String,
                externalReferenceNumber: String,
                ircs: String,
                vesselIdentifier: VesselIdentifier,
                afterDateTime: ZonedDateTime): VesselBeaconMalfunctionsResumeAndHistory {
        val value = when (vesselIdentifier) {
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> internalReferenceNumber
            VesselIdentifier.IRCS -> ircs
            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER -> externalReferenceNumber
        }

        val beaconMalfunctions = beaconMalfunctionsRepository.findAllByVesselIdentifierEquals(vesselIdentifier, value, afterDateTime)

        val beaconMalfunctionsWithDetails = beaconMalfunctions.map {
            val comments = beaconMalfunctionCommentsRepository.findAllByBeaconMalfunctionId(it.id)
            val actions = beaconMalfunctionActionsRepository.findAllByBeaconMalfunctionId(it.id)

            BeaconMalfunctionWithDetails(it, comments, actions)
        }

        val resume = VesselBeaconMalfunctionsResume.fromBeaconMalfunctions(beaconMalfunctionsWithDetails)
        val currentBeaconMalfunction = beaconMalfunctionsWithDetails.find {
            it.beaconMalfunction.stage != Stage.ARCHIVED && it.beaconMalfunction.stage != Stage.END_OF_MALFUNCTION
        }
        val history = beaconMalfunctionsWithDetails.filter {
            it.beaconMalfunction.id != currentBeaconMalfunction?.beaconMalfunction?.id
        }

        return VesselBeaconMalfunctionsResumeAndHistory(
                resume = resume,
                current = currentBeaconMalfunction,
                history = history
        )
    }
}
