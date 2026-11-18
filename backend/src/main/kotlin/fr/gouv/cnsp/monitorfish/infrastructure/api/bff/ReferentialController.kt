package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ReferentialVersionsDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.ReferentialSnapshots
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/referentials")
@Tag(name = "APIs for referentials")
class ReferentialController(
    private val referentialSnapshots: ReferentialSnapshots,
) {
    @GetMapping("/versions")
    @Operation(summary = "Get the version of each referential, to request them with `?v=<version>`")
    fun getVersions(): ReferentialVersionsDataOutput =
        ReferentialVersionsDataOutput(
            gears = referentialSnapshots.gears().version,
            infractions = referentialSnapshots.infractions().version,
            ports = referentialSnapshots.ports().version,
            regulations = referentialSnapshots.regulations().version,
            species = referentialSnapshots.species().version,
        )
}
