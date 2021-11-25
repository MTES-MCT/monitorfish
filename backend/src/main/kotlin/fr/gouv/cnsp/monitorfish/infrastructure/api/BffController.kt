package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.Alert
import fr.gouv.cnsp.monitorfish.domain.use_cases.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateControlObjectiveDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.*
import io.micrometer.core.instrument.MeterRegistry
import io.swagger.annotations.*
import kotlinx.coroutines.runBlocking
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.ZonedDateTime
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger
import javax.websocket.server.PathParam


@RestController
@RequestMapping("/bff")
@Api(description = "API for UI frontend")
class BffController(
        private val getLastPositions: GetLastPositions,
        private val getVessel: GetVessel,
        private val getVesselPositions: GetVesselPositions,
        private val getVesselVoyage: GetVesselVoyage,
        private val getAllGears: GetAllGears,
        private val getAllSpeciesAndSpeciesGroups: GetAllSpeciesAndSpeciesGroups,
        private val searchVessels: SearchVessels,
        private val getVesselControls: GetVesselControls,
        private val getAllFleetSegments: GetAllFleetSegments,
        private val getHealthcheck: GetHealthcheck,
        private val getAllControlObjectives: GetAllControlObjectives,
        private val updateControlObjective: UpdateControlObjective,
        private val getOperationalAlerts: GetOperationalAlerts,
        meterRegistry: MeterRegistry) {

    // TODO Move this the it's own infrastructure Metric class
    val vesselsTimer = meterRegistry.timer("ws_vessel_requests_latency_seconds_summary");
    val ersTimer = meterRegistry.timer("ws_ers_requests_latency_seconds_summary");
    val vesselsGauge = meterRegistry.gauge("ws_vessels_stored_in_last_positions", AtomicInteger(0))

    @GetMapping("/v1/vessels")
    @ApiOperation("Get all vessels' last position")
    fun getVessels(): List<LastPositionDataOutput> {
        val positions = getLastPositions.execute()
        vesselsGauge?.set(positions.size)

        return positions.map { position ->
            position.let {
                LastPositionDataOutput.fromLastPosition(position)
            }
        }
    }

    @GetMapping("/v1/vessels/find")
    @ApiOperation("Get vessel's positions and data")
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
                  trackDepth: VesselTrackDepth,
                  @ApiParam("Vessel positions identifier")
                  @RequestParam(name = "vesselIdentifier")
                  vesselIdentifier: VesselIdentifier,
                  @ApiParam("from date")
                  @RequestParam(name = "afterDateTime", required = false)
                  @DateTimeFormat(pattern = zoneDateTimePattern)
                  afterDateTime: ZonedDateTime?,
                  @ApiParam("to date")
                  @RequestParam(name = "beforeDateTime", required = false)
                  @DateTimeFormat(pattern = zoneDateTimePattern)
                  beforeDateTime: ZonedDateTime?): ResponseEntity<VesselAndPositionsDataOutput> {
        return runBlocking {
            val start = System.currentTimeMillis()

            val (vesselTrackHasBeenModified, vesselWithData) = getVessel.execute(
                    internalReferenceNumber,
                    externalReferenceNumber,
                    IRCS,
                    trackDepth,
                    vesselIdentifier,
                    afterDateTime,
                    beforeDateTime)

            val returnCode = if (vesselTrackHasBeenModified) HttpStatus.ACCEPTED else HttpStatus.OK

            vesselsTimer.record(System.currentTimeMillis() - start, TimeUnit.MILLISECONDS)

            ResponseEntity.status(returnCode).body(VesselAndPositionsDataOutput.fromVesselWithData(vesselWithData))
        }
    }

    @GetMapping("/v1/vessels/positions")
    @ApiOperation("Get vessel's positions")
    fun getVesselPositions(@ApiParam("Vessel internal reference number (CFR)")
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
                  trackDepth: VesselTrackDepth,
                  @ApiParam("Vessel positions identifier")
                  @RequestParam(name = "vesselIdentifier")
                  vesselIdentifier: VesselIdentifier,
                  @ApiParam("from date")
                  @RequestParam(name = "afterDateTime", required = false)
                  @DateTimeFormat(pattern = zoneDateTimePattern)
                  afterDateTime: ZonedDateTime?,
                  @ApiParam("to date")
                  @RequestParam(name = "beforeDateTime", required = false)
                  @DateTimeFormat(pattern = zoneDateTimePattern)
                  beforeDateTime: ZonedDateTime?): ResponseEntity<List<PositionDataOutput>> {
        return runBlocking {
            val start = System.currentTimeMillis()

            val (vesselTrackHasBeenModified, positions) = getVesselPositions.execute(
                    internalReferenceNumber,
                    externalReferenceNumber,
                    IRCS,
                    trackDepth,
                    vesselIdentifier,
                    afterDateTime,
                    beforeDateTime)

            val returnCode = if (vesselTrackHasBeenModified) HttpStatus.ACCEPTED else HttpStatus.OK

            vesselsTimer.record(System.currentTimeMillis() - start, TimeUnit.MILLISECONDS)

            val positionsDataOutput = positions.await().map {
                PositionDataOutput.fromPosition(it)
            }
            ResponseEntity.status(returnCode).body(positionsDataOutput)
        }
    }

    companion object {
        const val zoneDateTimePattern = "yyyy-MM-dd'T'HH:mm:ss.000X"
    }

    @GetMapping("/v1/vessels/{vesselId}/controls")
    @ApiOperation("Get vessel's controls")
    fun getVesselControls(@PathParam("Vessel id")
                          @PathVariable(name = "vesselId")
                          vesselId: String,
                          @ApiParam("Control after date time")
                          @RequestParam(name = "afterDateTime")
                          @DateTimeFormat(pattern = zoneDateTimePattern)
                          afterDateTime: ZonedDateTime): ControlResumeAndControlsDataOutput {
        val controlResumeAndControls = getVesselControls.execute(vesselId.toInt(), afterDateTime)

        return ControlResumeAndControlsDataOutput.fromControlResumeAndControls(controlResumeAndControls)
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
    fun getVesselERSMessages(@ApiParam("Vessel internal reference number (CFR)", required = true)
                             @RequestParam(name = "internalReferenceNumber")
                             internalReferenceNumber: String,
                             @ApiParam("Voyage request (LAST, PREVIOUS or NEXT) with respect to date", required = true)
                             @RequestParam(name = "voyageRequest")
                             voyageRequest: VoyageRequest,
                             @ApiParam("Trip number")
                             @RequestParam(name = "tripNumber", required = false)
                             tripNumber: Int?): VoyageDataOutput {
        val start = System.currentTimeMillis()

        val voyage = getVesselVoyage.execute(internalReferenceNumber, voyageRequest, tripNumber)

        ersTimer.record(System.currentTimeMillis() - start, TimeUnit.MILLISECONDS);
        return VoyageDataOutput.fromVoyage(voyage)
    }

    @GetMapping("/v1/gears")
    @ApiOperation("Get FAO fishing gear codes")
    fun getGears(): List<GearDataOutput> {
        return getAllGears.execute().map { gear ->
            GearDataOutput.fromGear(gear)
        }
    }

    @GetMapping("/v1/species")
    @ApiOperation("Get FAO species codes and groups")
    fun getSpecies(): SpeciesAndSpeciesGroupsDataOutput {
        return SpeciesAndSpeciesGroupsDataOutput.fromSpeciesAndSpeciesGroups(getAllSpeciesAndSpeciesGroups.execute())
    }

    @GetMapping("/v1/fleet_segments")
    @ApiOperation("Get fleet segments")
    fun getFleetSegments(): List<FleetSegmentDataOutput> {
        return getAllFleetSegments.execute().map { fleetSegment ->
            FleetSegmentDataOutput.fromFleetSegment(fleetSegment)
        }
    }

    @GetMapping("/v1/healthcheck")
    @ApiOperation("Get healtcheck of positions and ers")
    fun getHealthcheck(): HealthDataOutput {
        return HealthDataOutput.fromHealth(getHealthcheck.execute())
    }

    @GetMapping("/v1/control_objectives")
    @ApiOperation("Get control objectives")
    fun getControlObjectives(): List<ControlObjectiveDataOutput> {
        return getAllControlObjectives.execute().map { controlObjective ->
            ControlObjectiveDataOutput.fromControlObjective(controlObjective)
        }
    }

    @PutMapping(value = ["/v1/control_objectives/{controlObjectiveId}"], consumes = ["application/json"])
    @ApiOperation("Update a control objective")
    fun updateControlObjective(@PathParam("Control objective id")
                    @PathVariable(name = "controlObjectiveId")
                    controlObjectiveId: Int,
                    @RequestBody
                    updateControlObjectiveData: UpdateControlObjectiveDataInput) {
        updateControlObjective.execute(
                id = controlObjectiveId,
                targetNumberOfControlsAtSea = updateControlObjectiveData.targetNumberOfControlsAtSea,
                targetNumberOfControlsAtPort = updateControlObjectiveData.targetNumberOfControlsAtPort,
                controlPriorityLevel = updateControlObjectiveData.controlPriorityLevel
        )
    }

    @GetMapping("/v1/alerts")
    @ApiOperation("Get operational alerts")
    fun getOperationalAlerts(): List<Alert> {
        return getOperationalAlerts.execute()
    }
}
