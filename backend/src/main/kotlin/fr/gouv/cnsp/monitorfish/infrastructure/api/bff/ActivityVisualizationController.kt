package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.activity.GetActivityVisualizationFile
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/activity_visualization")
@Tag(name = "APIs for activity visualization")
class ActivityVisualizationController(
    private val getActivityVisualizationFile: GetActivityVisualizationFile,
) {
    @GetMapping("")
    @Operation(summary = "Get activity visualization")
    fun getActivityVisualization(): String = getActivityVisualizationFile.execute()
}
