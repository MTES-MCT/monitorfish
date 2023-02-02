package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.ControlsSummary
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionActionType
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
            .filter {
                it.actionType in setOf(
                    MissionActionType.SEA_CONTROL,
                    MissionActionType.AIR_CONTROL,
                    MissionActionType.LAND_CONTROL
                )
            }
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

        val numberOfDiversions = controlsWithCodeValues
            .filter { it.seizureAndDiversion == true }
            .size

        val numberOfGearSeized = controlsWithCodeValues
            .filter {
                it.gearInfractions.any {
                        gearInfraction ->
                    gearInfraction.gearSeized == true
                }
            }.size
        val numberOfSpeciesSeized = controlsWithCodeValues
            .filter {
                it.speciesInfractions.any {
                        speciesInfraction ->
                    speciesInfraction.speciesSeized == true
                }
            }.size

        ControlsSummary(
            vesselId = vesselId,
            numberOfDiversions = numberOfDiversions,
            numberOfGearSeized = numberOfGearSeized,
            numberOfSpeciesSeized = numberOfSpeciesSeized,
            controls = controlsWithCodeValues
        )
    }
}
