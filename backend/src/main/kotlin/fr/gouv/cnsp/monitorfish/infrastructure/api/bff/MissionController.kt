package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.missions.GetAllMissions
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.MissionDataOutput
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
        @Parameter(description = "Natures de mission")
        @RequestParam(name = "missionNature", required = false)
        missionNatures: List<String>?,
        @Parameter(description = "Types de mission")
        @RequestParam(name = "missionTypes", required = false)
        missionTypes: List<String>?,
        @Parameter(description = "Statuts de mission")
        @RequestParam(name = "missionStatus", required = false)
        missionStatuses: List<String>?,
        @Parameter(description = "Facades")
        @RequestParam(name = "seaFronts", required = false)
        seaFronts: List<String>?,
    ): List<MissionDataOutput> {
        val missions = getAllMissions.execute(
            startedAfterDateTime = startedAfterDateTime,
            startedBeforeDateTime = startedBeforeDateTime,
            missionNatures = missionNatures,
            missionStatuses = missionStatuses,
            missionTypes = missionTypes,
            seaFronts = seaFronts,
            pageNumber = pageNumber,
            pageSize = pageSize
        )
        return missions.map { MissionDataOutput.fromMission(it) }
    }

}
