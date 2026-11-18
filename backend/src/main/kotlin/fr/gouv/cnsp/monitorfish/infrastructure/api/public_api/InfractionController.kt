package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.infraction.GetAllInfractionThreatCharacterization
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.REFERENTIAL_VERSION_PARAMETER_DESCRIPTION
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.ThreatHierarchyDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.InfractionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.InfractionThreatCharacterizationDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.ReferentialSnapshots
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/infractions")
@Tag(name = "APIs for Infractions")
class InfractionController(
    private val getAllInfractionThreatCharacterization: GetAllInfractionThreatCharacterization,
    private val referentialSnapshots: ReferentialSnapshots,
) {
    @GetMapping("")
    @Operation(summary = "Get all infractions")
    fun getAllInfractionsController(
        @Parameter(description = REFERENTIAL_VERSION_PARAMETER_DESCRIPTION)
        @RequestParam(name = "v", required = false)
        version: String?,
    ): ResponseEntity<List<InfractionDataOutput>> = referentialSnapshots.infractions().toResponse(version)

    @GetMapping("/threats")
    @Operation(summary = "Get all infractions threat characterization")
    fun getAllInfractionThreatCharacterizationController(): List<ThreatHierarchyDataOutput> {
        val threatCharacterization = getAllInfractionThreatCharacterization.execute()

        return InfractionThreatCharacterizationDataOutput
            .fromInfractionThreatCharacterization(threatCharacterization)
    }
}
