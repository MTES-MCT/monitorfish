package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.missions.GetAllMissions
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.MissionWithActionsDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.*
import java.time.ZonedDateTime

@RestController
@RequestMapping("/bff/v1/missions")
@Tag(name = "Proxy APIs for missions")
class MissionController(
    private val getAllMissions: GetAllMissions,
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
        @Parameter(description = "Types de mission")
        @RequestParam(name = "missionTypes", required = false)
        missionTypes: List<String>?,
        @Parameter(description = "Statuts de mission")
        @RequestParam(name = "missionStatus", required = false)
        missionStatus: List<String>?,
        @Parameter(description = "Facades")
        @RequestParam(name = "seaFronts", required = false)
        seaFronts: List<String>?,
    ): List<MissionWithActionsDataOutput> {
        val missionsAndActions = getAllMissions.execute(
            startedAfterDateTime = startedAfterDateTime,
            startedBeforeDateTime = startedBeforeDateTime,
            missionSources = missionSources,
            missionStatus = missionStatus,
            missionTypes = missionTypes,
            seaFronts = seaFronts,
            pageNumber = pageNumber,
            pageSize = pageSize,
        )
        return missionsAndActions.map { MissionWithActionsDataOutput.fromMissionAndActions(it) }
    }
}
