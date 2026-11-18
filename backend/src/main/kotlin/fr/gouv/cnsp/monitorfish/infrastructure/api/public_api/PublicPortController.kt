package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.port.GetActivePorts
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.PortDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.toPortDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.Referential
import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.ReferentialInvalidation
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/ports")
@Tag(name = "Public APIs for ports")
class PublicPortController(
    private val getActivePorts: GetActivePorts,
    private val referentialInvalidation: ReferentialInvalidation,
) {
    @GetMapping("")
    @Operation(summary = "Get all active ports")
    fun getActivePorts(): List<PortDataOutput> =
        getActivePorts.execute().map { port ->
            port.toPortDataOutput()
        }

    @PutMapping(value = ["/invalidate"])
    @Operation(summary = "Invalidate ports cache")
    fun invalidatePorts() {
        referentialInvalidation.invalidate(Referential.PORTS)
    }
}
