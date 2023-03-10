package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.port.GetActivePorts
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PortDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/ports")
@Tag(name = "APIs for Ports")
class PortController(private val getActivePorts: GetActivePorts) {

    @GetMapping("")
    @Operation(summary = "Get all active ports")
    fun getActivePorts(): List<PortDataOutput> {
        return getActivePorts.execute().map { port ->
            PortDataOutput.fromPort(port)
        }
    }
}
