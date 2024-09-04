package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionWithDetails
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.VesselBeaconMalfunctionsResume
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.VesselBeaconMalfunctionsResumeAndHistory
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionCommentsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselBeaconMalfunctions(
    private val beaconMalfunctionsRepository: BeaconMalfunctionsRepository,
    private val beaconMalfunctionCommentsRepository: BeaconMalfunctionCommentsRepository,
    private val beaconMalfunctionActionsRepository: BeaconMalfunctionActionsRepository,
) {
    private val logger = LoggerFactory.getLogger(GetVesselBeaconMalfunctions::class.java)

    fun execute(
        vesselId: Int,
        afterDateTime: ZonedDateTime,
    ): VesselBeaconMalfunctionsResumeAndHistory {
        val beaconMalfunctions = beaconMalfunctionsRepository.findAllByVesselId(vesselId, afterDateTime)

        val beaconMalfunctionsWithDetails =
            beaconMalfunctions.map {
                val comments = beaconMalfunctionCommentsRepository.findAllByBeaconMalfunctionId(it.id)
                val actions = beaconMalfunctionActionsRepository.findAllByBeaconMalfunctionId(it.id)

                BeaconMalfunctionWithDetails(it, comments, actions)
            }

        val resume = VesselBeaconMalfunctionsResume.fromBeaconMalfunctions(beaconMalfunctionsWithDetails)
        val currentBeaconMalfunction =
            beaconMalfunctionsWithDetails.find {
                it.beaconMalfunction.stage != Stage.ARCHIVED
            }
        val history =
            beaconMalfunctionsWithDetails.filter {
                it.beaconMalfunction.id != currentBeaconMalfunction?.beaconMalfunction?.id
            }

        return VesselBeaconMalfunctionsResumeAndHistory(
            resume = resume,
            current = currentBeaconMalfunction,
            history = history,
        )
    }
}
