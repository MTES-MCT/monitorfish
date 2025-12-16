package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.infraction.GetAllInfractionThreatCharacterization
import fr.gouv.cnsp.monitorfish.domain.use_cases.infraction.GetAllInfractions
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.InfractionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.InfractionThreatCharacterizationDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ThreatDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/infractions")
@Tag(name = "APIs for Infractions")
class InfractionController(
    private val getAllInfractions: GetAllInfractions,
    private val getAllInfractionThreatCharacterization: GetAllInfractionThreatCharacterization,
) {
    @GetMapping("")
    @Operation(summary = "Get all infractions")
    fun getAllInfractionsController(): List<InfractionDataOutput> =
        getAllInfractions.execute().map { infraction ->
            InfractionDataOutput.fromInfraction(infraction)
        }

    @GetMapping("/threats")
    @Operation(summary = "Get all infractions threat characterization")
    fun getAllInfractionThreatCharacterizationController(): List<ThreatDataOutput> {
        val threatCharacterization = getAllInfractionThreatCharacterization.execute()

        return InfractionThreatCharacterizationDataOutput
            .fromInfractionThreatCharacterization(threatCharacterization)
    }
}
