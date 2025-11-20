package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.GetAllMissions
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.GetMission
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.dtos.InfractionFilterDTO
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.MissionWithActionsDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import kotlinx.coroutines.runBlocking
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.*
import java.time.ZonedDateTime

@RestController
@RequestMapping("/bff/v1/missions")
@Tag(name = "Proxy APIs for missions")
class MissionController(
    private val getAllMissions: GetAllMissions,
    private val getMission: GetMission,
) {
    @GetMapping("")
    @Operation(summary = "Get all missions")
    fun getAllMissionsController(
        @Parameter(description = "page number")
        @RequestParam(name = "pageNumber")
        pageNumber: Int?,
        @Parameter(description = "page size")
        @RequestParam(name = "pageSize")
        pageSize: Int?,
        @Parameter(description = "Mission started after date")
        @RequestParam(name = "startedAfterDateTime", required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        startedAfterDateTime: ZonedDateTime?,
        @Parameter(description = "Mission started before date")
        @RequestParam(name = "startedBeforeDateTime", required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        startedBeforeDateTime: ZonedDateTime?,
        @Parameter(description = "Origin")
        @RequestParam(name = "missionSource", required = false)
        missionSources: List<String>?,
        @Parameter(description = "Mission types")
        @RequestParam(name = "missionTypes", required = false)
        missionTypes: List<String>?,
        @Parameter(description = "Mission status")
        @RequestParam(name = "missionStatus", required = false)
        missionStatuses: List<String>?,
        @Parameter(description = "Infractions")
        @RequestParam(name = "infractions", required = false)
        infractionsFilter: List<InfractionFilterDTO>?,
        @Parameter(description = "Is mission part of a JointDeploymentPlan (JDP)")
        @RequestParam(name = "isUnderJdp", required = false)
        isUnderJdp: Boolean?,
        @Parameter(description = "Seafronts")
        @RequestParam(name = "seaFronts", required = false)
        seaFronts: List<String>?,
    ): List<MissionWithActionsDataOutput> {
        val missionsAndActions =
            getAllMissions.execute(
                startedAfterDateTime = startedAfterDateTime,
                startedBeforeDateTime = startedBeforeDateTime,
                missionSources = missionSources,
                missionStatuses = missionStatuses,
                missionTypes = missionTypes,
                seaFronts = seaFronts,
                pageNumber = pageNumber,
                pageSize = pageSize,
                infractionsFilter = infractionsFilter,
                isUnderJdp = isUnderJdp,
            )
        return missionsAndActions.map { MissionWithActionsDataOutput.fromMissionAndActions(it) }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get mission")
    fun getMissionController(
        @PathParam("Id")
        @PathVariable(name = "id")
        id: Int,
    ): MissionWithActionsDataOutput = runBlocking {
        val missionAndActions = getMission.execute(id)
        MissionWithActionsDataOutput.fromMissionAndActions(missionAndActions)
    }
}
