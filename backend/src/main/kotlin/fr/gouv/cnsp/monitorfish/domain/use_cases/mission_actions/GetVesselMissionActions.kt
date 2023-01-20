package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionActionsSummary
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import kotlinx.coroutines.coroutineScope
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselMissionActions(
    private val missionActionsRepository: MissionActionsRepository,
    private val portRepository: PortRepository,
    private val gearRepository: GearRepository,
    private val missionRepository: MissionRepository
) {
    private val logger = LoggerFactory.getLogger(GetVesselMissionActions::class.java)

    suspend fun execute(vesselId: Int, afterDateTime: ZonedDateTime): MissionActionsSummary = coroutineScope {
        logger.debug("Searching controls for vessel $vesselId after $afterDateTime")
        val missionActions = missionActionsRepository.findVesselMissionActionsAfterDateTime(vesselId, afterDateTime)
        logger.debug("Found ${missionActions.size} missions actions for vessel $vesselId")

        val actionsWithCodeValues = missionActions.map { action ->
            val controlUnits = missionRepository.findControlUnitsOfMission(this, action.missionId)

            Pair(action, controlUnits)
        }.map { (action, controlUnits) ->
            action.controlUnits = controlUnits.await()

            action.portLocode?.let { port ->
                try {
                    action.portName = portRepository.find(port).name
                } catch (e: CodeNotFoundException) {
                    logger.warn(e.message)
                }
            }

            action.gearOnboard.forEach { gearControl ->
                gearControl.gearCode?.let { gear ->
                    try {
                        gearControl.gearName = gearRepository.find(gear).name
                    } catch (e: CodeNotFoundException) {
                        logger.warn(e.message)
                    }
                }
            }

            action
        }

        val numberOfSeaControls = actionsWithCodeValues
            .filter { it.actionType == MissionActionType.SEA_CONTROL }
            .size
        val numberOfLandControls = actionsWithCodeValues
            .filter { it.actionType == MissionActionType.LAND_CONTROL }
            .size
        val numberOfAirControls = actionsWithCodeValues
            .filter { it.actionType == MissionActionType.AIR_CONTROL }
            .size
        val numberOfAirSurveillance = actionsWithCodeValues
            .filter { it.actionType == MissionActionType.AIR_SURVEILLANCE }
            .size

        val numberOfDiversions = actionsWithCodeValues
            .filter { it.diversion == true }
            .size
        val numberOfEscortsToQuay = actionsWithCodeValues
            .filter { it.seizureAndDiversion == true }
            .size

        MissionActionsSummary(
            vesselId = vesselId,
            numberOfSeaControls = numberOfSeaControls,
            numberOfLandControls = numberOfLandControls,
            numberOfAirControls = numberOfAirControls,
            numberOfAirSurveillance = numberOfAirSurveillance,
            numberOfDiversions = numberOfDiversions,
            numberOfEscortsToQuay = numberOfEscortsToQuay,
            numberOfFishingInfractions = 0,
            numberOfSecurityInfractions = 0,
            missionActions = actionsWithCodeValues
        )
    }
}
