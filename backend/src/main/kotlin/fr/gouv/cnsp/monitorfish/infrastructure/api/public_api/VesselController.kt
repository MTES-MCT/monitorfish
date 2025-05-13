package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVessels
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.SearchVessels
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.VesselIdentityDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/vessels")
@Tag(name = "APIs for Vessels")
class PublicVesselController(
    private val getVessels: GetVessels,
    private val searchVessels: SearchVessels,
) {
    @GetMapping("")
    @Operation(summary = "Get all vessels")
    fun getAllVessels(): List<VesselIdentityDataOutput> = getVessels.execute().map(VesselIdentityDataOutput::fromVessel)

    @GetMapping("/search")
    @Operation(summary = "Search vessels")
    fun searchVessel(
        @Parameter(
            description =
                "Vessel internal reference number (CFR), external marker, IRCS, MMSI, name or beacon number",
            required = true,
        )
        @RequestParam(name = "searched")
        searched: String,
    ): List<VesselIdentityDataOutput> =
        searchVessels.execute(searched).map {
            VesselIdentityDataOutput.fromVesselAndBeacon(it)
        }
}
