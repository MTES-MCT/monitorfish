package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.district.GetAllDistricts
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.TreeOptionDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/districts")
@Tag(name = "APIs for districts")
class DistrictController(
    private val getAllDistricts: GetAllDistricts
) {
    @GetMapping("")
    @Operation(summary = "Get all districts")
    fun getDistricts(): List<TreeOptionDataOutput> {
        val districts = getAllDistricts.execute()

        return TreeOptionDataOutput.fromDistricts(districts)
    }
}
