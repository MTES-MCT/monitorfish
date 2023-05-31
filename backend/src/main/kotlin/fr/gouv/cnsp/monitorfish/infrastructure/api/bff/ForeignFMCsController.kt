package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction.GetAllForeignFMCs
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ForeignFMCDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/foreign_fmcs")
@Tag(name = "APIs for foreign FMCs")
class ForeignFMCsController(private val getAllForeignFMCs: GetAllForeignFMCs) {

    @GetMapping("")
    @Operation(summary = "Get all foreign FMCs")
    fun getAllForeignFMCs(): List<ForeignFMCDataOutput> {
        return getAllForeignFMCs.execute().map { foreignFMC ->
            ForeignFMCDataOutput.fromForeignFMC(foreignFMC)
        }
    }
}
