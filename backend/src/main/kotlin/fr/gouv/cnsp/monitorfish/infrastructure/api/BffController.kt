package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.use_cases.GetAllGears
import fr.gouv.cnsp.monitorfish.domain.use_cases.GetLastPositions
import fr.gouv.cnsp.monitorfish.domain.use_cases.GetVessel
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.GearDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PositionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.VesselDataOutput
import io.micrometer.core.instrument.DistributionSummary
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import io.prometheus.client.Summary
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import io.swagger.annotations.ApiParam
import kotlinx.coroutines.runBlocking
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.concurrent.TimeUnit

@RestController
@RequestMapping("/bff")
@Api(description = "API for UI frontend")
class BffController(
        private val getLastPositions: GetLastPositions,
        private val getVessel: GetVessel,
        private val getAllGears: GetAllGears,
        private val meterRegistry: MeterRegistry) {

    val timer = meterRegistry.timer("ws_vessel_requests_latency_seconds_summary");

    @GetMapping("/v1/vessels")
    @ApiOperation("Get all vessels' last position")
    fun getPositions(): List<PositionDataOutput> {
        return getLastPositions.execute().map { position ->
            position.let {
                PositionDataOutput.fromPosition(position)
            }
        }
    }

    @GetMapping("/v1/vessels/search")
    @ApiOperation("Get vessel's last positions and data")
    fun getPosition(@ApiParam("Vessel internal reference number (CFR)", required = false)
                    @RequestParam(name = "internalReferenceNumber")
                    internalReferenceNumber: String,
                    @ApiParam("Vessel external reference number", required = false)
                    @RequestParam(name = "externalReferenceNumber")
                    externalReferenceNumber: String,
                    @ApiParam("Vessel IRCS", required = false)
                    @RequestParam(name = "IRCS")
                    IRCS: String): VesselDataOutput {
        return runBlocking {
            val start = System.currentTimeMillis()
            val (vessel, positions) = getVessel.execute(internalReferenceNumber, externalReferenceNumber, IRCS)
            timer.record(System.currentTimeMillis() - start, TimeUnit.MILLISECONDS);

            VesselDataOutput.fromVessel(vessel, positions)
        }
    }

    @GetMapping("/v1/gears")
    @ApiOperation("Get FAO fishing gear codes")
    fun getGears(): List<GearDataOutput> {
        return getAllGears.execute().map { gear ->
            gear.let {
                GearDataOutput.fromGear(gear)
            }
        }
    }
}
