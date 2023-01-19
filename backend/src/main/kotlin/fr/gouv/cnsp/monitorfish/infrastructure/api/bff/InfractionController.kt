package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.infraction.GetFishingInfractions
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.InfractionDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/infractions")
@Tag(name = "APIs for Infractions")
class InfractionController(private val getFishingInfractions: GetFishingInfractions) {

    @GetMapping("")
    @Operation(summary = "Get fishing infractions")
    fun getFishingInfractions(): List<InfractionDataOutput> {
        return getFishingInfractions.execute().map { infraction ->
            InfractionDataOutput.fromInfraction(infraction)
        }
    }
}
