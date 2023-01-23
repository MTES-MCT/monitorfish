package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.ControlsSummary
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import kotlinx.coroutines.coroutineScope
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselControls(
    private val missionActionsRepository: MissionActionsRepository,
    private val portRepository: PortRepository,
    private val gearRepository: GearRepository,
    private val missionRepository: MissionRepository
) {
    private val logger = LoggerFactory.getLogger(GetVesselControls::class.java)

    suspend fun execute(vesselId: Int, afterDateTime: ZonedDateTime): ControlsSummary = coroutineScope {
        logger.debug("Searching controls for vessel $vesselId after $afterDateTime")
        val controls = missionActionsRepository.findVesselMissionActionsAfterDateTime(vesselId, afterDateTime)
            .filter { it.actionType in setOf(MissionActionType.SEA_CONTROL, MissionActionType.AIR_CONTROL, MissionActionType.LAND_CONTROL) }
        logger.debug("Found ${controls.size} controls for vessel $vesselId")

        val controlsWithCodeValues = controls.map { action ->
            val controlUnits = missionRepository.findControlUnitsOfMission(this, action.missionId)

            Pair(action, controlUnits)
        }.map { (control, controlUnits) ->
            control.controlUnits = controlUnits.await()

            control.portLocode?.let { port ->
                try {
                    control.portName = portRepository.find(port).name
                } catch (e: CodeNotFoundException) {
                    logger.warn(e.message)
                }
            }

            control.gearOnboard.forEach { gearControl ->
                gearControl.gearCode?.let { gear ->
                    try {
                        gearControl.gearName = gearRepository.find(gear).name
                    } catch (e: CodeNotFoundException) {
                        logger.warn(e.message)
                    }
                }
            }

            control
        }

        val numberOfSeaControls = controlsWithCodeValues
            .filter { it.actionType == MissionActionType.SEA_CONTROL }
            .size
        val numberOfLandControls = controlsWithCodeValues
            .filter { it.actionType == MissionActionType.LAND_CONTROL }
            .size
        val numberOfAirControls = controlsWithCodeValues
            .filter { it.actionType == MissionActionType.AIR_CONTROL }
            .size
        val numberOfAirSurveillance = controlsWithCodeValues
            .filter { it.actionType == MissionActionType.AIR_SURVEILLANCE }
            .size

        val numberOfDiversions = controlsWithCodeValues
            .filter { it.diversion == true }
            .size
        val numberOfEscortsToQuay = controlsWithCodeValues
            .filter { it.seizureAndDiversion == true }
            .size

        ControlsSummary(
            vesselId = vesselId,
            numberOfSeaControls = numberOfSeaControls,
            numberOfLandControls = numberOfLandControls,
            numberOfAirControls = numberOfAirControls,
            numberOfAirSurveillance = numberOfAirSurveillance,
            numberOfDiversions = numberOfDiversions,
            numberOfEscortsToQuay = numberOfEscortsToQuay,
            numberOfFishingInfractions = 0,
            numberOfSecurityInfractions = 0,
            controls = controlsWithCodeValues
        )
    }
}
