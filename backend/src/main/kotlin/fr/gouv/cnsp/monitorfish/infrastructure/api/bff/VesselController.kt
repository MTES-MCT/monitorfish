package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.*
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
import javax.websocket.server.PathParam

@RestController
@RequestMapping("/bff/v1/vessels")
@Api(description = "APIs for Vessels")
class VesselController(
    private val getLastPositions: GetLastPositions,
    private val getVessel: GetVessel,
    private val getVesselPositions: GetVesselPositions,
    private val getVesselVoyage: GetVesselVoyage,
    private val searchVessels: SearchVessels,
    private val getVesselControls: GetVesselControls,
    private val getVesselBeaconMalfunctions: GetVesselBeaconMalfunctions,
    private val getVesselReportings: GetVesselReportings,
    meterRegistry: MeterRegistry
) {

    // TODO Move this the it's own infrastructure Metric class
    val vesselsTimer = meterRegistry.timer("ws_vessel_requests_latency_seconds_summary")
    val logbookTimer = meterRegistry.timer("ws_logbook_requests_latency_seconds_summary")
    val vesselsGauge = meterRegistry.gauge("ws_vessels_stored_in_last_positions", AtomicInteger(0))

    @GetMapping("")
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

    @GetMapping("/find")
    @ApiOperation("Get vessel information and positions")
    fun getVessel(
        @ApiParam("Vessel internal id")
        @RequestParam(name = "vesselId")
        vesselId: Int?,
        @ApiParam("Vessel internal reference number (CFR)")
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
        beforeDateTime: ZonedDateTime?
    ): ResponseEntity<VesselAndPositionsDataOutput> {
        return runBlocking {
            val start = System.currentTimeMillis()

            val (vesselTrackHasBeenModified, vesselWithData) = getVessel.execute(
                vesselId,
                internalReferenceNumber,
                externalReferenceNumber,
                IRCS,
                trackDepth,
                vesselIdentifier,
                afterDateTime,
                beforeDateTime
            )

            val returnCode = if (vesselTrackHasBeenModified) HttpStatus.ACCEPTED else HttpStatus.OK

            vesselsTimer.record(System.currentTimeMillis() - start, TimeUnit.MILLISECONDS)

            ResponseEntity.status(returnCode).body(VesselAndPositionsDataOutput.fromVesselWithData(vesselWithData))
        }
    }

    @GetMapping("/beacon_malfunctions")
    @ApiOperation("Get vessel's beacon malfunctions history")
    fun getVesselBeaconMalfunctions(
        @ApiParam("Vessel id")
        @RequestParam(name = "vesselId")
        vesselId: Int,
        @ApiParam("beacon malfunctions after date time")
        @RequestParam(name = "afterDateTime")
        @DateTimeFormat(pattern = zoneDateTimePattern)
        afterDateTime: ZonedDateTime
    ): BeaconMalfunctionsResumeAndHistoryDataOutput {
        val beaconMalfunctionsWithDetails = getVesselBeaconMalfunctions.execute(
            vesselId,
            afterDateTime
        )

        return BeaconMalfunctionsResumeAndHistoryDataOutput.fromBeaconMalfunctionsResumeAndHistory(
            beaconMalfunctionsWithDetails
        )
    }

    @GetMapping("/positions")
    @ApiOperation("Get vessel's positions")
    fun getVesselPositions(
        @ApiParam("Vessel internal reference number (CFR)")
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
        beforeDateTime: ZonedDateTime?
    ): ResponseEntity<List<PositionDataOutput>> {
        return runBlocking {
            val start = System.currentTimeMillis()

            val (vesselTrackHasBeenModified, positions) = getVesselPositions.execute(
                internalReferenceNumber,
                externalReferenceNumber,
                IRCS,
                trackDepth,
                vesselIdentifier,
                afterDateTime,
                beforeDateTime
            )

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

    @GetMapping("/{vesselId}/controls")
    @ApiOperation("Get vessel's controls")
    fun getVesselControls(
        @PathParam("Vessel id")
        @PathVariable(name = "vesselId")
        vesselId: String,
        @ApiParam("Control after date time")
        @RequestParam(name = "afterDateTime")
        @DateTimeFormat(pattern = zoneDateTimePattern)
        afterDateTime: ZonedDateTime
    ): ControlSummaryDataOutput {
        val controlResumeAndControls = getVesselControls.execute(vesselId.toInt(), afterDateTime)

        return ControlSummaryDataOutput.fromControlSummary(controlResumeAndControls)
    }

    @GetMapping("/reporting")
    @ApiOperation("Get vessel's reporting")
    fun getVesselReporting(
        @ApiParam("Vessel internal reference number (CFR)")
        @RequestParam(name = "internalReferenceNumber")
        internalReferenceNumber: String,
        @ApiParam("Vessel external reference number")
        @RequestParam(name = "externalReferenceNumber")
        externalReferenceNumber: String,
        @ApiParam("Vessel IRCS")
        @RequestParam(name = "IRCS")
        IRCS: String,
        @ApiParam("Vessel positions identifier")
        @RequestParam(name = "vesselIdentifier")
        vesselIdentifier: VesselIdentifier?,
        @ApiParam("Reporting from date time")
        @RequestParam(name = "fromDate")
        @DateTimeFormat(pattern = zoneDateTimePattern)
        fromDate: ZonedDateTime
    ): CurrentAndArchivedReportingDataOutput {
        val currentAndArchivedReportings = getVesselReportings.execute(
            internalReferenceNumber,
            externalReferenceNumber,
            IRCS,
            vesselIdentifier,
            fromDate
        )

        return CurrentAndArchivedReportingDataOutput.fromCurrentAndArchivedReporting(currentAndArchivedReportings)
    }

    @GetMapping("/search")
    @ApiOperation("Search vessels")
    fun searchVessel(
        @ApiParam(
            "Vessel internal reference number (CFR), external marker, IRCS, MMSI, name or beacon number",
            required = true
        )
        @RequestParam(name = "searched")
        searched: String
    ): List<VesselIdentityDataOutput> {
        return searchVessels.execute(searched).map {
            VesselIdentityDataOutput.fromVessel(it)
        }
    }

    @GetMapping("/logbook/find")
    @ApiOperation("Get vessel's Logbook messages")
    fun getVesselLogbookMessages(
        @ApiParam("Vessel internal reference number (CFR)", required = true)
        @RequestParam(name = "internalReferenceNumber")
        internalReferenceNumber: String,
        @ApiParam(
            "Voyage request (LAST, PREVIOUS or NEXT) with respect to date",
            required = true
        )
        @RequestParam(name = "voyageRequest")
        voyageRequest: VoyageRequest,
        @ApiParam("Trip number")
        @RequestParam(name = "tripNumber", required = false)
        tripNumber: String?
    ): VoyageDataOutput {
        val start = System.currentTimeMillis()

        val voyage = getVesselVoyage.execute(internalReferenceNumber, voyageRequest, tripNumber)

        logbookTimer.record(System.currentTimeMillis() - start, TimeUnit.MILLISECONDS)
        return VoyageDataOutput.fromVoyage(voyage)
    }
}
