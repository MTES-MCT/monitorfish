package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.*
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import kotlinx.coroutines.runBlocking
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.ZonedDateTime

@RestController
@RequestMapping("/bff/v1/vessels")
@Tag(name = "APIs for Vessels")
class VesselController(
    private val getLastPositions: GetLastPositions,
    private val getVessel: GetVessel,
    private val getVesselPositions: GetVesselPositions,
    private val getVesselVoyage: GetVesselVoyage,
    private val searchVessels: SearchVessels,
    private val getVesselBeaconMalfunctions: GetVesselBeaconMalfunctions,
    private val getVesselReportings: GetVesselReportings,
    private val getVesselRiskFactor: GetVesselRiskFactor,
) {

    @GetMapping("")
    @Operation(summary = "Get all vessels' last position")
    fun getVessels(): List<LastPositionDataOutput> {
        val positions = getLastPositions.execute()

        return positions.map { position ->
            position.let {
                LastPositionDataOutput.fromLastPosition(position)
            }
        }
    }

    @GetMapping("/find")
    @Operation(summary = "Get vessel information and positions")
    fun getVessel(
        @Parameter(description = "Vessel internal id")
        @RequestParam(name = "vesselId")
        vesselId: Int?,
        @Parameter(description = "Vessel internal reference number (CFR)")
        @RequestParam(name = "internalReferenceNumber")
        internalReferenceNumber: String,
        @Parameter(description = "Vessel external reference number")
        @RequestParam(name = "externalReferenceNumber")
        externalReferenceNumber: String,
        @Parameter(description = "Vessel IRCS")
        @RequestParam(name = "IRCS")
        IRCS: String,
        @Parameter(description = "Vessel track depth")
        @RequestParam(name = "trackDepth")
        trackDepth: VesselTrackDepth,
        @Parameter(description = "Vessel positions identifier")
        @RequestParam(name = "vesselIdentifier")
        vesselIdentifier: VesselIdentifier?,
        @Parameter(description = "from date")
        @RequestParam(name = "afterDateTime", required = false)
        @DateTimeFormat(pattern = zoneDateTimePattern)
        afterDateTime: ZonedDateTime?,
        @Parameter(description = "to date")
        @RequestParam(name = "beforeDateTime", required = false)
        @DateTimeFormat(pattern = zoneDateTimePattern)
        beforeDateTime: ZonedDateTime?,
    ): ResponseEntity<VesselAndPositionsDataOutput> {
        return runBlocking {
            val (vesselTrackHasBeenModified, vesselWithData) = getVessel.execute(
                vesselId,
                internalReferenceNumber,
                externalReferenceNumber,
                IRCS,
                trackDepth,
                vesselIdentifier,
                afterDateTime,
                beforeDateTime,
            )

            val returnCode = if (vesselTrackHasBeenModified) HttpStatus.ACCEPTED else HttpStatus.OK

            ResponseEntity.status(returnCode).body(VesselAndPositionsDataOutput.fromVesselWithData(vesselWithData))
        }
    }

    @GetMapping("/beacon_malfunctions")
    @Operation(summary = "Get vessel's beacon malfunctions history")
    fun getVesselBeaconMalfunctions(
        @Parameter(description = "Vessel id")
        @RequestParam(name = "vesselId")
        vesselId: Int,
        @Parameter(description = "beacon malfunctions after date time")
        @RequestParam(name = "afterDateTime")
        @DateTimeFormat(pattern = zoneDateTimePattern)
        afterDateTime: ZonedDateTime,
    ): BeaconMalfunctionsResumeAndHistoryDataOutput {
        val beaconMalfunctionsWithDetails = getVesselBeaconMalfunctions.execute(
            vesselId,
            afterDateTime,
        )

        return BeaconMalfunctionsResumeAndHistoryDataOutput.fromBeaconMalfunctionsResumeAndHistory(
            beaconMalfunctionsWithDetails,
        )
    }

    @GetMapping("/positions")
    @Operation(summary = "Get vessel's positions")
    fun getVesselPositions(
        @Parameter(description = "Vessel internal reference number (CFR)")
        @RequestParam(name = "internalReferenceNumber")
        internalReferenceNumber: String,
        @Parameter(description = "Vessel external reference number")
        @RequestParam(name = "externalReferenceNumber")
        externalReferenceNumber: String,
        @Parameter(description = "Vessel IRCS")
        @RequestParam(name = "IRCS")
        IRCS: String,
        @Parameter(description = "Vessel track depth")
        @RequestParam(name = "trackDepth")
        trackDepth: VesselTrackDepth,
        @Parameter(description = "Vessel positions identifier")
        @RequestParam(name = "vesselIdentifier")
        vesselIdentifier: VesselIdentifier?,
        @Parameter(description = "from date")
        @RequestParam(name = "afterDateTime", required = false)
        @DateTimeFormat(pattern = zoneDateTimePattern)
        afterDateTime: ZonedDateTime?,
        @Parameter(description = "to date")
        @RequestParam(name = "beforeDateTime", required = false)
        @DateTimeFormat(pattern = zoneDateTimePattern)
        beforeDateTime: ZonedDateTime?,
    ): ResponseEntity<List<PositionDataOutput>> {
        return runBlocking {
            val (vesselTrackHasBeenModified, positions) = getVesselPositions.execute(
                internalReferenceNumber,
                externalReferenceNumber,
                IRCS,
                trackDepth,
                vesselIdentifier,
                afterDateTime,
                beforeDateTime,
            )

            val returnCode = if (vesselTrackHasBeenModified) HttpStatus.ACCEPTED else HttpStatus.OK

            val positionsDataOutput = positions.await().map {
                PositionDataOutput.fromPosition(it)
            }
            ResponseEntity.status(returnCode).body(positionsDataOutput)
        }
    }

    companion object {
        const val zoneDateTimePattern = "yyyy-MM-dd'T'HH:mm:ss.000X"
    }

    @GetMapping("/reporting")
    @Operation(summary = "Get vessel's reporting")
    fun getVesselReporting(
        @Parameter(description = "Vessel internal reference number (CFR)")
        @RequestParam(name = "internalReferenceNumber")
        internalReferenceNumber: String,
        @Parameter(description = "Vessel external reference number")
        @RequestParam(name = "externalReferenceNumber")
        externalReferenceNumber: String,
        @Parameter(description = "Vessel IRCS")
        @RequestParam(name = "IRCS")
        IRCS: String,
        @Parameter(description = "Vessel positions identifier")
        @RequestParam(name = "vesselIdentifier")
        vesselIdentifier: VesselIdentifier?,
        @Parameter(description = "Reporting from date time")
        @RequestParam(name = "fromDate")
        @DateTimeFormat(pattern = zoneDateTimePattern)
        fromDate: ZonedDateTime,
    ): CurrentAndArchivedReportingDataOutput {
        val currentAndArchivedReportings = getVesselReportings.execute(
            internalReferenceNumber,
            externalReferenceNumber,
            IRCS,
            vesselIdentifier,
            fromDate,
        )

        return CurrentAndArchivedReportingDataOutput.fromCurrentAndArchivedReporting(currentAndArchivedReportings)
    }

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
    ): List<VesselIdentityDataOutput> {
        return searchVessels.execute(searched).map {
            VesselIdentityDataOutput.fromVessel(it)
        }
    }

    @GetMapping("/logbook/find")
    @Operation(summary = "Get vessel's Logbook messages")
    fun getVesselLogbookMessages(
        @Parameter(description = "Vessel internal reference number (CFR)", required = true)
        @RequestParam(name = "internalReferenceNumber")
        internalReferenceNumber: String,
        @Parameter(
            description =
            "Voyage request (LAST, PREVIOUS or NEXT) with respect to date",
            required = true,
        )
        @RequestParam(name = "voyageRequest")
        voyageRequest: VoyageRequest,
        @Parameter(description = "Trip number")
        @RequestParam(name = "tripNumber", required = false)
        tripNumber: String?,
    ): VoyageDataOutput {
        val voyage = getVesselVoyage.execute(internalReferenceNumber, voyageRequest, tripNumber)
        return VoyageDataOutput.fromVoyage(voyage)
    }

    @GetMapping("/risk_factor")
    @Operation(summary = "Get vessel risk factor")
    fun getVesselRiskFactor(
        @Parameter(description = "Vessel internal reference number (CFR)")
        @RequestParam(name = "internalReferenceNumber")
        internalReferenceNumber: String,
    ): RiskFactorDataOutput {
        val riskFactor = getVesselRiskFactor.execute(internalReferenceNumber)

        return RiskFactorDataOutput.fromVesselRiskFactor(riskFactor)
    }
}
