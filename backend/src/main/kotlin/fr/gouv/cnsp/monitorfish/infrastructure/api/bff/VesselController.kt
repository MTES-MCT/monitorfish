package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.GetVesselReportings
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.*
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import kotlinx.coroutines.runBlocking
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.bind.annotation.*
import java.time.ZonedDateTime

@RestController
@RequestMapping("/bff/v1/vessels")
@Tag(name = "APIs for Vessels")
class VesselController(
    private val getActiveVessels: GetActiveVessels,
    private val getVessel: GetVessel,
    private val getVesselById: GetVesselById,
    private val getVesselPositions: GetVesselPositions,
    private val getVesselVoyage: GetVesselVoyage,
    private val getVesselVoyageByDates: GetVesselVoyageByDates,
    private val searchVessels: SearchVessels,
    private val getVesselBeaconMalfunctions: GetVesselBeaconMalfunctions,
    private val getVesselReportings: GetVesselReportings,
    private val getVesselRiskFactor: GetVesselRiskFactor,
    private val getVesselLastTripNumbers: GetVesselLastTripNumbers,
) {
    @GetMapping("")
    @Operation(summary = "Get all active vessels")
    fun getVessels(
        @AuthenticationPrincipal principal: OidcUser,
    ): List<ActiveVesselBaseDataOutput> {
        val email: String = principal.email
        val activeVessels = getActiveVessels.execute(email)

        return activeVessels.mapIndexed { index, vessel ->
            ActiveVesselBaseDataOutput.fromEnrichedActiveVessel(
                enrichedActiveVessel = vessel,
                index = index,
            )
        }
    }

    @GetMapping("/{vesselId}")
    @Operation(summary = "Get a vessel by its ID")
    fun getVesselById(
        @PathParam("Vessel ID")
        @PathVariable(name = "vesselId")
        vesselId: Int,
    ): SelectedVesselDataOutput = SelectedVesselDataOutput.fromVessel(getVesselById.execute(vesselId))

    @GetMapping("/find")
    @Operation(summary = "Get vessel information and positions")
    fun getVesselAndPositions(
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
        @AuthenticationPrincipal principal: OidcUser,
    ): ResponseEntity<SelectedVesselAndPositionsDataOutput> =
        runBlocking {
            val email: String = principal.email

            val (vesselTrackHasBeenModified, vesselInformation) =
                getVessel.execute(
                    vesselId = vesselId,
                    internalReferenceNumber = internalReferenceNumber,
                    externalReferenceNumber = externalReferenceNumber,
                    ircs = IRCS,
                    trackDepth = trackDepth,
                    vesselIdentifier = vesselIdentifier,
                    fromDateTime = afterDateTime,
                    toDateTime = beforeDateTime,
                    userEmail = email,
                )

            val returnCode = if (vesselTrackHasBeenModified) HttpStatus.ACCEPTED else HttpStatus.OK

            ResponseEntity
                .status(
                    returnCode,
                ).body(SelectedVesselAndPositionsDataOutput.fromEnrichedActiveVesselWithPositions(vesselInformation))
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
        val beaconMalfunctionsWithDetails =
            getVesselBeaconMalfunctions.execute(
                vesselId = vesselId,
                afterDateTime = afterDateTime,
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
            val (vesselTrackHasBeenModified, positions) =
                getVesselPositions.execute(
                    internalReferenceNumber = internalReferenceNumber,
                    externalReferenceNumber = externalReferenceNumber,
                    ircs = IRCS,
                    trackDepth = trackDepth,
                    vesselIdentifier = vesselIdentifier,
                    fromDateTime = afterDateTime,
                    toDateTime = beforeDateTime,
                )

            val returnCode = if (vesselTrackHasBeenModified) HttpStatus.ACCEPTED else HttpStatus.OK

            val positionsDataOutput =
                positions.await().map {
                    PositionDataOutput.fromPosition(it)
                }

            return@runBlocking ResponseEntity.status(returnCode).body(positionsDataOutput)
        }
    }

    companion object {
        const val zoneDateTimePattern = "yyyy-MM-dd'T'HH:mm:ss.000X"
    }

    @GetMapping("/reportings")
    @Operation(summary = "Get vessel's reporting")
    fun getReportingsByVesselIdentity(
        @Parameter(description = "Vessel id")
        @RequestParam(name = "vesselId")
        vesselId: Int?,
        @Parameter(description = "Vessel internal reference number (CFR)")
        @RequestParam(name = "internalReferenceNumber")
        internalReferenceNumber: String,
        @Parameter(description = "Vessel external reference number")
        @RequestParam(name = "externalReferenceNumber")
        externalReferenceNumber: String,
        @Parameter(description = "Vessel IRCS")
        @RequestParam(name = "ircs")
        ircs: String,
        @Parameter(description = "Vessel positions identifier")
        @RequestParam(name = "vesselIdentifier")
        vesselIdentifier: VesselIdentifier?,
        @Parameter(description = "Reporting from date time")
        @RequestParam(name = "fromDate")
        @DateTimeFormat(pattern = zoneDateTimePattern)
        fromDate: ZonedDateTime,
    ): VesselReportingsDataOutput {
        val currentAndArchivedReportings =
            getVesselReportings.execute(
                vesselId,
                internalReferenceNumber,
                externalReferenceNumber,
                ircs,
                vesselIdentifier,
                fromDate,
            )

        return VesselReportingsDataOutput.fromCurrentAndArchivedReporting(currentAndArchivedReportings)
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
    ): List<VesselIdentityDataOutput> =
        searchVessels.execute(searched).map {
            VesselIdentityDataOutput.fromVesselAndBeacon(it)
        }

    @GetMapping("/logbook/find_by_dates")
    @Operation(summary = "Get vessel's Logbook messages by dates")
    fun getVesselLogbookMessagesByDates(
        @Parameter(description = "Vessel internal reference number (CFR)", required = true)
        @RequestParam(name = "internalReferenceNumber")
        internalReferenceNumber: String,
        @Parameter(description = "Vessel track depth")
        @RequestParam(name = "trackDepth")
        trackDepth: VesselTrackDepth,
        @Parameter(description = "from date")
        @RequestParam(name = "afterDateTime", required = false)
        @DateTimeFormat(pattern = zoneDateTimePattern)
        afterDateTime: ZonedDateTime?,
        @Parameter(description = "to date")
        @RequestParam(name = "beforeDateTime", required = false)
        @DateTimeFormat(pattern = zoneDateTimePattern)
        beforeDateTime: ZonedDateTime?,
    ): VoyageDataOutput {
        val voyage =
            getVesselVoyageByDates.execute(
                internalReferenceNumber = internalReferenceNumber,
                trackDepth = trackDepth,
                fromDateTime = afterDateTime,
                toDateTime = beforeDateTime,
            )
        return VoyageDataOutput.fromVoyage(voyage)
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
        val voyage =
            getVesselVoyage.execute(
                internalReferenceNumber = internalReferenceNumber,
                voyageRequest = voyageRequest,
                tripNumber = tripNumber,
            )
        return VoyageDataOutput.fromVoyage(voyage)
    }

    @GetMapping("/logbook/last")
    @Operation(summary = "Get vessel's last Logbook trip numbers")
    fun getVesselLogbookVoyages(
        @Parameter(description = "Vessel internal reference number (CFR)", required = true)
        @RequestParam(name = "internalReferenceNumber")
        internalReferenceNumber: String,
    ): List<String> = getVesselLastTripNumbers.execute(internalReferenceNumber)

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
