package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.entities.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.use_cases.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.*
import io.micrometer.core.instrument.MeterRegistry
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import io.swagger.annotations.ApiParam
import kotlinx.coroutines.runBlocking
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger

@RestController
@RequestMapping("/bff")
@Api(description = "API for UI frontend")
class BffController(
        private val getLastPositions: GetLastPositions,
        private val getVessel: GetVessel,
        private val getVesselLastVoyage: GetVesselLastVoyage,
        private val getAllGears: GetAllGears,
        private val getAllSpecies: GetAllSpecies,
        private val searchVessels: SearchVessels,
        private val getVesselControls: GetVesselControls,
        meterRegistry: MeterRegistry) {

    // TODO Move this the it's own infrastructure Metric class
    val vesselsTimer = meterRegistry.timer("ws_vessel_requests_latency_seconds_summary");
    val ersTimer = meterRegistry.timer("ws_ers_requests_latency_seconds_summary");
    val vesselsGauge = meterRegistry.gauge("ws_vessels_stored_in_last_positions", AtomicInteger(0))

    @GetMapping("/v1/vessels")
    @ApiOperation("Get all vessels' last position")
    fun getVessels(): List<PositionDataOutput> {
        val positions = getLastPositions.execute()
        vesselsGauge?.set(positions.size)

        return positions.map { position ->
            position.let {
                PositionDataOutput.fromPosition(position)
            }
        }
    }

    @GetMapping("/v1/vessels/find")
    @ApiOperation("Get vessel's last positions and data")
    fun getVessel(@ApiParam("Vessel internal reference number (CFR)")
                    @RequestParam(name = "internalReferenceNumber")
                    internalReferenceNumber: String,
                    @ApiParam("Vessel external reference number")
                    @RequestParam(name = "externalReferenceNumber")
                    externalReferenceNumber: String,
                    @ApiParam("Vessel IRCS")
                    @RequestParam(name = "IRCS")
                    IRCS: String,
                    @ApiParam("Vessel track depth")
                    @RequestParam(name = "trackDepth")
                    trackDepth: VesselTrackDepth): ResponseEntity<VesselDataOutput> {
        return runBlocking {
            val start = System.currentTimeMillis()
            val (vesselTrackHasBeenModified, VesselAndPositions) = getVessel.execute(internalReferenceNumber, externalReferenceNumber, IRCS, trackDepth)
            val (vessel, positions) = VesselAndPositions
            val returnCode = if(vesselTrackHasBeenModified) HttpStatus.ACCEPTED else HttpStatus.OK

            vesselsTimer.record(System.currentTimeMillis() - start, TimeUnit.MILLISECONDS)

            ResponseEntity.status(returnCode).body(VesselDataOutput.fromVessel(vessel, positions))
        }
    }

    @GetMapping("/v1/vessels/search")
    @ApiOperation("Search vessels")
    fun searchVessel(@ApiParam("Vessel internal reference number (CFR), external marker, IRCS, MMSI or name", required = true)
                      @RequestParam(name = "searched")
                      searched: String): List<VesselIdentityDataOutput> {
        return searchVessels.execute(searched).map {
            VesselIdentityDataOutput.fromVessel(it)
        }
    }

    @GetMapping("/v1/ers/find")
    @ApiOperation("Get vessel's ERS messages")
    fun getVesselERSMessages(@ApiParam("Vessel internal reference number (CFR)")
                  @RequestParam(name = "internalReferenceNumber")
                  internalReferenceNumber: String,
                  @ApiParam("Vessel external reference number")
                  @RequestParam(name = "externalReferenceNumber")
                  externalReferenceNumber: String,
                  @ApiParam("Vessel IRCS")
                  @RequestParam(name = "IRCS")
                  IRCS: String): ERSMessagesAndAlertsDataOutput {
        val start = System.currentTimeMillis()
        val ersMessagesAndAlerts = getVesselLastVoyage.execute(internalReferenceNumber, externalReferenceNumber, IRCS)
        ersTimer.record(System.currentTimeMillis() - start, TimeUnit.MILLISECONDS);

        return ERSMessagesAndAlertsDataOutput.fromERSMessagesAndAlerts(ersMessagesAndAlerts)
    }

    @GetMapping("/v1/gears")
    @ApiOperation("Get FAO fishing gear codes")
    fun getGears(): List<GearDataOutput> {
        return getAllGears.execute().map { gear ->
            GearDataOutput.fromGear(gear)
        }
    }

    @GetMapping("/v1/species")
    @ApiOperation("Get FAO species codes")
    fun getSpecies(): List<SpeciesDataOutput> {
        return getAllSpecies.execute().map { species ->
            SpeciesDataOutput.fromSpecies(species)
        }
    }

    @GetMapping("/v1/controls/find")
    @ApiOperation("Get vessel's controls")
    fun getVesselControls(@ApiParam("Control id")
                    @RequestParam(name = "vesselId")
                    vesselId: Int) : List<ControlDataOutput> {
        return getVesselControls.execute(vesselId).map { control ->
            ControlDataOutput.fromControl(control)
        }
    }
}
