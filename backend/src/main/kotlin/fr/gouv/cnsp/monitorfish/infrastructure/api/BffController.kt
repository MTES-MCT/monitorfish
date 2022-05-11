package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.entities.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.use_cases.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.SaveBeaconMalfunctionCommentDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateBeaconMalfunctionDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateControlObjectiveDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateFleetSegmentDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.*
import io.micrometer.core.instrument.MeterRegistry
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import io.swagger.annotations.ApiParam
import kotlinx.coroutines.runBlocking
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.ZonedDateTime
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger
import javax.servlet.http.HttpServletRequest
import javax.websocket.server.PathParam
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.AddControlObjectiveDataInput as AddControlObjectiveDataInput1

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
        private val updateFleetSegment: UpdateFleetSegment,
        private val getHealthcheck: GetHealthcheck,
        private val getControlObjectivesOfYear: GetControlObjectivesOfYear,
        private val getControlObjectiveYearEntries: GetControlObjectiveYearEntries,
        private val addControlObjectiveYear: AddControlObjectiveYear,
        private val updateControlObjective: UpdateControlObjective,
        private val deleteControlObjective: DeleteControlObjective,
        private val addControlObjective: AddControlObjective,
        private val getOperationalAlerts: GetOperationalAlerts,
        private val getAllBeaconMalfunctions: GetAllBeaconMalfunctions,
        private val updateBeaconMalfunction: UpdateBeaconMalfunction,
        private val getBeaconMalfunction: GetBeaconMalfunction,
        private val saveBeaconMalfunctionComment: SaveBeaconMalfunctionComment,
        private val getVesselBeaconMalfunctions: GetVesselBeaconMalfunctions,
        private val getFAOAreas: GetFAOAreas,
        meterRegistry: MeterRegistry) {

    // TODO Move this the it's own infrastructure Metric class
    val vesselsTimer = meterRegistry.timer("ws_vessel_requests_latency_seconds_summary");
    val logbookTimer = meterRegistry.timer("ws_logbook_requests_latency_seconds_summary");
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
                  vesselIdentifier: VesselIdentifier?,
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

    @GetMapping("/v1/vessels/beacon_malfunctions")
    @ApiOperation("Get vessel's beacon malfunctions history")
    fun getVesselBeaconMalfunctions(@ApiParam("Vessel internal reference number (CFR)")
                                    @RequestParam(name = "internalReferenceNumber")
                                    internalReferenceNumber: String,
                                    @ApiParam("Vessel external reference number")
                                    @RequestParam(name = "externalReferenceNumber")
                                    externalReferenceNumber: String,
                                    @ApiParam("Vessel IRCS")
                                    @RequestParam(name = "IRCS")
                                    IRCS: String,
                                    @ApiParam("Vessel identifier")
                                    @RequestParam(name = "vesselIdentifier")
                                    vesselIdentifier: VesselIdentifier?,
                                    @ApiParam("beacon malfunctions after date time")
                                    @RequestParam(name = "afterDateTime")
                                    @DateTimeFormat(pattern = zoneDateTimePattern)
                                    afterDateTime: ZonedDateTime): BeaconMalfunctionsResumeAndHistoryDataOutput {
        val beaconMalfunctionsWithDetails = getVesselBeaconMalfunctions.execute(
                internalReferenceNumber,
                externalReferenceNumber,
                IRCS,
                vesselIdentifier,
                afterDateTime)

        return BeaconMalfunctionsResumeAndHistoryDataOutput.fromBeaconMalfunctionsResumeAndHistory(beaconMalfunctionsWithDetails)
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
                           vesselIdentifier: VesselIdentifier?,
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

    @GetMapping("/v1/logbook/find")
    @ApiOperation("Get vessel's Logbook messages")
    fun getVesselLogbookMessages(@ApiParam("Vessel internal reference number (CFR)", required = true)
                             @RequestParam(name = "internalReferenceNumber")
                             internalReferenceNumber: String,
                                 @ApiParam("Voyage request (LAST, PREVIOUS or NEXT) with respect to date", required = true)
                             @RequestParam(name = "voyageRequest")
                             voyageRequest: VoyageRequest,
                                 @ApiParam("Trip number")
                             @RequestParam(name = "tripNumber", required = false)
                             tripNumber: String?): VoyageDataOutput {
        val start = System.currentTimeMillis()

        val voyage = getVesselVoyage.execute(internalReferenceNumber, voyageRequest, tripNumber)

        logbookTimer.record(System.currentTimeMillis() - start, TimeUnit.MILLISECONDS);
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

    @PutMapping(value = ["/v1/fleet_segments/**"], consumes = ["application/json"])
    @ApiOperation("Update a fleet segment")
    fun updateFleetSegment(request: HttpServletRequest,
                           @RequestBody
                           updateFleetSegmentData: UpdateFleetSegmentDataInput): FleetSegment {
        val segmentPartOfURL = 1
        val segment = request.requestURI.split(request.contextPath + "/fleet_segments/")[segmentPartOfURL]

        return updateFleetSegment.execute(
                segment = segment,
                fields = updateFleetSegmentData.toUpdateFleetSegmentFields())
    }

    @GetMapping("/v1/healthcheck")
    @ApiOperation("Get healtcheck of positions and logbook")
    fun getHealthcheck(): HealthDataOutput {
        return HealthDataOutput.fromHealth(getHealthcheck.execute())
    }

    @GetMapping("/v1/control_objectives/{year}")
    @ApiOperation("Get control objectives of a given year")
    fun getControlObjectivesOfYear(@PathParam("Year")
                             @PathVariable(name = "year")
                             year: Int): List<ControlObjectiveDataOutput> {
        return getControlObjectivesOfYear.execute(year).map { controlObjective ->
            ControlObjectiveDataOutput.fromControlObjective(controlObjective)
        }
    }

    @GetMapping("/v1/control_objectives/years")
    @ApiOperation("Get control objective year entries")
    fun getControlObjectiveYearEntries(): List<Int> {
        return getControlObjectiveYearEntries.execute()
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/v1/control_objectives/years")
    @ApiOperation("Add a control objective year")
    fun addControlObjectiveYear() {
        return addControlObjectiveYear.execute()
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
                controlPriorityLevel = updateControlObjectiveData.controlPriorityLevel)
    }

    @DeleteMapping(value = ["/v1/control_objectives/{controlObjectiveId}"])
    @ApiOperation("Delete a control objective")
    fun deleteControlObjective(@PathParam("Control objective id")
                               @PathVariable(name = "controlObjectiveId")
                               controlObjectiveId: Int) {
        deleteControlObjective.execute(controlObjectiveId)
    }

    @PostMapping(value = ["/v1/control_objectives"], consumes = ["application/json"])
    @ApiOperation("Add a control objective")
    fun addControlObjective(@RequestBody
                            addControlObjectiveData: AddControlObjectiveDataInput1): Int {
        return addControlObjective.execute(
                segment = addControlObjectiveData.segment,
                facade = addControlObjectiveData.facade,
                year = addControlObjectiveData.year
        )
    }

    @GetMapping("/v1/operational_alerts")
    @ApiOperation("Get operational alerts")
    fun getOperationalAlerts(): List<PendingAlert> {
        return getOperationalAlerts.execute()
    }

    @GetMapping(value = ["/v1/beacon_malfunctions"])
    @ApiOperation("Get all beacon malfunctions")
    fun getAllBeaconMalfunctions(): List<BeaconMalfunctionDataOutput> {
        return getAllBeaconMalfunctions.execute().map {
            BeaconMalfunctionDataOutput.fromBeaconMalfunction(it)
        }
    }

    @PutMapping(value = ["/v1/beacon_malfunctions/{beaconMalfunctionId}"], consumes = ["application/json"])
    @ApiOperation("Update a beacon malfunction")
    fun updateBeaconMalfunction(@PathParam("Beacon malfunction id")
                                @PathVariable(name = "beaconMalfunctionId")
                                beaconMalfunctionId: Int,
                                @RequestBody
                                updateBeaconMalfunctionData: UpdateBeaconMalfunctionDataInput): BeaconMalfunctionResumeAndDetailsDataOutput {
        return updateBeaconMalfunction.execute(
                id = beaconMalfunctionId,
                vesselStatus = updateBeaconMalfunctionData.vesselStatus,
                stage = updateBeaconMalfunctionData.stage,
                endOfBeaconMalfunctionReason = updateBeaconMalfunctionData.endOfBeaconMalfunctionReason,
        ).let {
            BeaconMalfunctionResumeAndDetailsDataOutput.fromBeaconMalfunctionResumeAndDetails(it)
        }
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping(value = ["/v1/beacon_malfunctions/{beaconMalfunctionId}/comments"], consumes = ["application/json"])
    @ApiOperation("Save a beacon malfunction comment and return the updated beacon malfunction")
    fun saveBeaconMalfunctionComment(@PathParam("Beacon malfunction id")
                                     @PathVariable(name = "beaconMalfunctionId")
                                     beaconMalfunctionId: Int,
                                     @RequestBody
                                     saveBeaconMalfunctionCommentDataInput: SaveBeaconMalfunctionCommentDataInput): BeaconMalfunctionResumeAndDetailsDataOutput {
        return saveBeaconMalfunctionComment.execute(
                beaconMalfunctionId = beaconMalfunctionId,
                comment = saveBeaconMalfunctionCommentDataInput.comment,
                userType = saveBeaconMalfunctionCommentDataInput.userType).let {
            BeaconMalfunctionResumeAndDetailsDataOutput.fromBeaconMalfunctionResumeAndDetails(it)
        }
    }

    @GetMapping(value = ["/v1/beacon_malfunctions/{beaconMalfunctionId}"])
    @ApiOperation("Get a beacon malfunction with the comments and history")
    fun getBeaconMalfunction(@PathParam("Beacon malfunction id")
                             @PathVariable(name = "beaconMalfunctionId")
                             beaconMalfunctionId: Int): BeaconMalfunctionResumeAndDetailsDataOutput {
        return BeaconMalfunctionResumeAndDetailsDataOutput.fromBeaconMalfunctionResumeAndDetails(getBeaconMalfunction.execute(beaconMalfunctionId))
    }

    @GetMapping("/v1/fao_areas")
    @ApiOperation("Get FAO areas")
    fun getFAOAreas(): List<String> {
        return getFAOAreas.execute()
    }
}
