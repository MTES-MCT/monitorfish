package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.actrep.ActivityCode
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.actrep.JointDeploymentPlan
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions.dtos.ActivityReport
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetActivityReports(
    private val missionActionsRepository: MissionActionsRepository,
    private val portRepository: PortRepository,
    private val vesselRepository: VesselRepository,
    private val missionRepository: MissionRepository,
) {
    private val logger = LoggerFactory.getLogger(GetActivityReports::class.java)

    fun execute(beforeDateTime: ZonedDateTime, afterDateTime: ZonedDateTime, jdp: JointDeploymentPlan): List<ActivityReport> {
        val controls = missionActionsRepository.findControlsInDates(beforeDateTime, afterDateTime)
        logger.info("Found ${controls.size} controls between dates [$afterDateTime, $beforeDateTime].")

        if (controls.isEmpty()) {
            return listOf()
        }

        val controlledVesselsIds = controls.mapNotNull { it.vesselId }.distinct()
        val vessels = vesselRepository.findVesselsByIds(controlledVesselsIds)

        val missionIds = controls.map { it.missionId }.distinct()
        val missions = missionRepository.findByIds(missionIds)
        logger.info("Found ${missions.size} missions.")

        val filteredControls = controls.filter { control ->
            when (control.actionType) {
                MissionActionType.LAND_CONTROL -> {
                    val speciesOnboardCodes = control.speciesOnboard.mapNotNull { it.speciesCode }
                    val tripFaoCodes = control.faoAreas

                    return@filter jdp.isLandControlApplicable(speciesOnboardCodes, tripFaoCodes)
                }
                MissionActionType.SEA_CONTROL -> {
                    val controlMission = missions.firstOrNull { mission -> mission.id == control.missionId }
                    if (controlMission == null) {
                        logger.error(
                            "Mission id '${control.missionId}' linked to control id '${control.id}' could not be found.",
                        )
                    }

                    // The mission must be under JDP
                    return@filter controlMission?.isUnderJdp == true
                }

                else -> throw IllegalArgumentException("Bad control type: ${control.actionType}")
            }
        }
        logger.info("Found ${filteredControls.size} controls to report.")

        return filteredControls.map { control ->
            val activityCode = when (control.actionType) {
                MissionActionType.LAND_CONTROL -> ActivityCode.LAN
                MissionActionType.SEA_CONTROL -> ActivityCode.FIS
                else -> throw IllegalArgumentException("Bad control type: ${control.actionType}")
            }

            val controlledVessel = try {
                vessels.first { vessel -> vessel.id == control.vesselId }
            } catch (e: NoSuchElementException) {
                throw NoSuchElementException("The vessel id ${control.vesselId} could not be found.", e)
            }
            val controlMission = try {
                missions.first { mission -> mission.id == control.missionId }
            } catch (e: NoSuchElementException) {
                throw NoSuchElementException("The mission id ${control.missionId} could not be found.", e)
            }

            control.portLocode?.let { port ->
                try {
                    control.portName = portRepository.find(port).name
                } catch (e: CodeNotFoundException) {
                    logger.warn(e.message)
                }
            }

            ActivityReport(
                action = control,
                activityCode = activityCode,
                controlUnits = controlMission.controlUnits,
                vesselNationalIdentifier = controlledVessel.getNationalIdentifier(),
                vessel = controlledVessel,
            )
        }
    }
}