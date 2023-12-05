package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.infraction.GetAllInfractions
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.InfractionDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/infractions")
@Tag(name = "APIs for Infractions")
class InfractionController(private val getAllInfractions: GetAllInfractions) {

    @GetMapping("")
    @Operation(summary = "Get all infractions")
    fun getAllInfractionsController(): List<InfractionDataOutput> {
        return getAllInfractions.execute().map { infraction ->
            InfractionDataOutput.fromInfraction(infraction)
        }
    }
}
