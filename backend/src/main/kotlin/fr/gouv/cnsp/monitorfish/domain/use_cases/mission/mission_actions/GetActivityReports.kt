package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FAOArea
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.actrep.ActivityCode
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.actrep.JointDeploymentPlan
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.hasFaoCodeIncludedIn
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.dtos.ActivityReport
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.dtos.ActivityReports
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetActivityReports(
    private val missionActionsRepository: MissionActionsRepository,
    private val portRepository: PortRepository,
    private val vesselRepository: VesselRepository,
    private val segmentRepository: FleetSegmentRepository,
    private val missionRepository: MissionRepository,
) {
    private val logger = LoggerFactory.getLogger(GetActivityReports::class.java)

    fun execute(beforeDateTime: ZonedDateTime, afterDateTime: ZonedDateTime, jdp: JointDeploymentPlan): ActivityReports {
        val jdpFaoAreas = jdp.getOperationalZones()
        val controls = missionActionsRepository.findControlsInDates(beforeDateTime, afterDateTime)
        logger.info("Found ${controls.size} controls between dates [$afterDateTime, $beforeDateTime].")

        if (controls.isEmpty()) {
            return ActivityReports(
                activityReports = listOf(),
                jdpSpecies = jdp.getSpeciesCodes(),
            )
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

                    return@filter jdp.isLandControlApplicable(control.flagState, speciesOnboardCodes, tripFaoCodes)
                }

                MissionActionType.SEA_CONTROL -> {
                    val controlMission = missions.firstOrNull { mission -> mission.id == control.missionId }
                    val isUnderJdp = controlMission?.isUnderJdp == true
                    if (controlMission == null) {
                        logger.error(
                            "Mission id '${control.missionId}' linked to SEA control id '${control.id}' could not be found. Is this mission deleted ?",
                        )
                    }

                    if (control.faoAreas.isNotEmpty()) {
                        val foundFaoAreaIncludedInJdp = getFirstFaoAreaIncludedInJdp(jdpFaoAreas, control.faoAreas)

                        return@filter isUnderJdp && foundFaoAreaIncludedInJdp != null
                    }

                    // The mission must be under JDP
                    return@filter isUnderJdp
                }

                else -> throw IllegalArgumentException("Bad control type: ${control.actionType}")
            }
        }.filter { control ->
            val controlMission = missions.firstOrNull { mission -> mission.id == control.missionId }
            // All AECP reports are excluded from the response
            // see: https://github.com/MTES-MCT/monitorfish/issues/3194
            return@filter !(controlMission?.controlUnits?.any { controlUnit -> controlUnit.administration == "AECP" } ?: false)
        }
        logger.info("Found ${filteredControls.size} controls to report.")

        val activityReports = filteredControls.map { control ->
            val activityCode = when (control.actionType) {
                MissionActionType.LAND_CONTROL -> ActivityCode.LAN
                MissionActionType.SEA_CONTROL -> ActivityCode.FIS
                else -> throw IllegalArgumentException("Bad control type: ${control.actionType}")
            }

            val controlledVessel = try {
                vessels.first { vessel -> vessel.id == control.vesselId }
            } catch (e: NoSuchElementException) {
                logger.error("The vessel id ${control.vesselId} could not be found.", e)

                return@map null
            }
            val controlMission = try {
                missions.first { mission -> mission.id == control.missionId }
            } catch (e: NoSuchElementException) {
                logger.error(
                    "Mission id '${control.missionId}' linked to ${control.actionType} control id '${control.id}' could not be found. Is this mission deleted ?",
                    e,
                )

                return@map null
            }

            control.portLocode?.let { port ->
                try {
                    control.portName = portRepository.findByLocode(port).name
                } catch (e: CodeNotFoundException) {
                    logger.warn(e.message)
                }
            }
            val faoArea = getFirstFaoAreaIncludedInJdp(jdpFaoAreas, control.faoAreas)
            val segment = getFirstFleetSegmentIncludedInFaoArea(control, faoArea)

            ActivityReport(
                action = control,
                activityCode = activityCode,
                controlUnits = controlMission.controlUnits,
                faoArea = faoArea?.faoCode,
                segment = segment?.segment,
                vesselNationalIdentifier = controlledVessel.getNationalIdentifier(),
                vessel = controlledVessel,
            )
        }.filterNotNull()

        return ActivityReports(
            activityReports = activityReports,
            jdpSpecies = jdp.getSpeciesCodes(),
        )
    }

    private fun getFirstFleetSegmentIncludedInFaoArea(
        control: MissionAction,
        controlFaoArea: FAOArea?,
    ): FleetSegment? {
        val segment = segmentRepository.findAllByYear(control.actionDatetimeUtc.year)
            .firstOrNull { yearSegment ->
                control.segments.any { controlSegment ->
                    yearSegment.segment === controlSegment.segment &&
                        yearSegment.faoAreas.any { controlFaoArea?.hasFaoCodeIncludedIn(it) ?: false }
                }
            }

        return segment
    }

    private fun getFirstFaoAreaIncludedInJdp(
        jdpFaoAreas: List<String>?,
        faoAreas: List<String>,
    ): FAOArea? {
        val foundFaoArea = jdpFaoAreas?.let { jdpFaoAreasNotNull ->
            faoAreas
                .map { controlFaoArea -> FAOArea(controlFaoArea) }
                .firstOrNull { controlFaoArea ->
                    jdpFaoAreasNotNull.any { jdpFaoArea ->
                        controlFaoArea.hasFaoCodeIncludedIn(jdpFaoArea)
                    }
                }
        }

        return foundFaoArea
    }
}
