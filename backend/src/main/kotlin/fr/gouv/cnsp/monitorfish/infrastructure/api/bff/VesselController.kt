package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselLocation
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import fr.gouv.cnsp.monitorfish.domain.use_cases.logbook.GetHasFilledLogbookForCurrentTrip
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.GetVesselReportings
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetActiveVessels
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetLastPositionsAIS
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetSpeciesControlPrefillFromLogbook
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVessel
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselAISPositions
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselBeaconMalfunctions
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselById
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselContactToUpdateByVesselId
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselTripNumbers
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselVMSAndAISPositions
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselVoyage
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselVoyageByDates
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.SaveVesselContactToUpdate
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.SearchVessels
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.VesselContactToUpdateDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ActiveVesselBaseDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.BeaconMalfunctionsResumeAndHistoryDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.LastPositionAISDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PositionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.RiskFactorDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.SelectedVesselAndPositionsDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.SelectedVesselDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.SpeciesControlPrefillDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.VesselContactToUpdateDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.VesselContactToUpdateDataOutput.Companion.fromVesselContactToUpdate
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.VesselIdentityDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.VesselReportingsDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.VoyageDataOutput
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
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.time.ZonedDateTime

@RestController
@RequestMapping("/bff/v1/vessels")
@Tag(name = "APIs for Vessels")
class VesselController(
    private val getActiveVessels: GetActiveVessels,
    private val getLastPositionsAIS: GetLastPositionsAIS,
    private val getVessel: GetVessel,
    private val getControlledVesselById: GetControlledVesselById,
    private val getVesselVMSAndAISPositions: GetVesselVMSAndAISPositions,
    private val getVesselAISPositions: GetVesselAISPositions,
    private val getVesselVoyage: GetVesselVoyage,
    private val getVesselVoyageByDates: GetVesselVoyageByDates,
    private val searchVessels: SearchVessels,
    private val getVesselBeaconMalfunctions: GetVesselBeaconMalfunctions,
    private val getVesselReportings: GetVesselReportings,
    private val getVesselRiskFactor: GetVesselRiskFactor,
    private val getVesselTripNumbers: GetVesselTripNumbers,
    private val getSpeciesControlPrefillFromLogbook: GetSpeciesControlPrefillFromLogbook,
    private val getHasFilledLogbookForCurrentTrip: GetHasFilledLogbookForCurrentTrip,
    private val getVesselContactToUpdateByVesselId: GetVesselContactToUpdateByVesselId,
    private val saveVesselContactToUpdate: SaveVesselContactToUpdate,
) {
    @GetMapping("")
    @Operation(summary = "Get all active vessels")
    fun getVessels(
        @AuthenticationPrincipal principal: OidcUser?,
    ): List<ActiveVesselBaseDataOutput> {
        val email = principal?.email ?: ""
        val activeVessels = getActiveVessels.execute(email)

        return activeVessels.mapIndexed { index, vessel ->
            ActiveVesselBaseDataOutput.fromEnrichedActiveVessel(
                enrichedActiveVessel = vessel,
                index = index,
            )
        }
    }

    @GetMapping("/ais")
    @Operation(summary = "Get all AIS last positions")
    fun getVessels(
        @RequestParam(required = false) vesselLocation: VesselLocation?,
    ): List<LastPositionAISDataOutput> {
        val lastPositionsAIS = getLastPositionsAIS.execute(vesselLocation)

        return lastPositionsAIS.map {
            LastPositionAISDataOutput.fromLastPositionAIS(it)
        }
    }

    @GetMapping("/ais/positions")
    @Operation(summary = "Get vessel's AIS positions")
    fun getVesselAISPositions(
        @Parameter(description = "MMSI")
        @RequestParam(name = "mmsi")
        mmsi: Long,
        @Parameter(description = "Vessel track depth")
        @RequestParam(name = "trackDepth")
        trackDepth: VesselTrackDepth,
        @Parameter(description = "from date")
        @RequestParam(name = "afterDateTime", required = false)
        @DateTimeFormat(pattern = ZONE_DATE_TIME_PATTERN)
        afterDateTime: ZonedDateTime?,
        @Parameter(description = "to date")
        @RequestParam(name = "beforeDateTime", required = false)
        @DateTimeFormat(pattern = ZONE_DATE_TIME_PATTERN)
        beforeDateTime: ZonedDateTime?,
    ): List<PositionDataOutput> =
        getVesselAISPositions
            .execute(
                mmsi = mmsi,
                trackDepth = trackDepth,
                fromDateTime = afterDateTime,
                toDateTime = beforeDateTime,
            ).map {
                PositionDataOutput.fromPosition(it)
            }

    @GetMapping("/{vesselId}")
    @Operation(summary = "Get a vessel by its ID")
    fun getVesselById(
        @PathParam("Vessel ID")
        @PathVariable(name = "vesselId")
        vesselId: Int,
        @AuthenticationPrincipal principal: OidcUser?,
    ): ControlledVesselDataOutput =
        runBlocking {
            val email = principal?.email ?: ""
            val controlledVessel = getControlledVesselById.execute(vesselId = vesselId, userEmail = email)

            ControlledVesselDataOutput.fromVessel(
                vessel = controlledVessel.controlledVessel,
                vesselGroups = controlledVessel.groups,
                tripReportings = controlledVessel.tripReportings,
            )
        }

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
        @DateTimeFormat(pattern = ZONE_DATE_TIME_PATTERN)
        afterDateTime: ZonedDateTime?,
        @Parameter(description = "to date")
        @RequestParam(name = "beforeDateTime", required = false)
        @DateTimeFormat(pattern = ZONE_DATE_TIME_PATTERN)
        beforeDateTime: ZonedDateTime?,
        @AuthenticationPrincipal principal: OidcUser?,
    ): ResponseEntity<SelectedVesselAndPositionsDataOutput> =
        runBlocking {
            val email = principal?.email ?: ""

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
                .status(returnCode)
                .body(SelectedVesselAndPositionsDataOutput.fromEnrichedActiveVesselWithPositions(vesselInformation))
        }

    @GetMapping("/beacon_malfunctions")
    @Operation(summary = "Get vessel's beacon malfunctions history")
    fun getVesselBeaconMalfunctions(
        @Parameter(description = "Vessel id")
        @RequestParam(name = "vesselId")
        vesselId: Int,
        @Parameter(description = "beacon malfunctions after date time")
        @RequestParam(name = "afterDateTime")
        @DateTimeFormat(pattern = ZONE_DATE_TIME_PATTERN)
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
        @DateTimeFormat(pattern = ZONE_DATE_TIME_PATTERN)
        afterDateTime: ZonedDateTime?,
        @Parameter(description = "to date")
        @RequestParam(name = "beforeDateTime", required = false)
        @DateTimeFormat(pattern = ZONE_DATE_TIME_PATTERN)
        beforeDateTime: ZonedDateTime?,
    ): ResponseEntity<List<PositionDataOutput>> =
        runBlocking {
            val (vesselTrackHasBeenModified, positions) =
                getVesselVMSAndAISPositions.execute(
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

            ResponseEntity.status(returnCode).body(positionsDataOutput)
        }

    companion object {
        const val ZONE_DATE_TIME_PATTERN = "yyyy-MM-dd'T'HH:mm:ss.000X"
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
        @DateTimeFormat(pattern = ZONE_DATE_TIME_PATTERN)
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
        @DateTimeFormat(pattern = ZONE_DATE_TIME_PATTERN)
        afterDateTime: ZonedDateTime?,
        @Parameter(description = "to date")
        @RequestParam(name = "beforeDateTime", required = false)
        @DateTimeFormat(pattern = ZONE_DATE_TIME_PATTERN)
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

    @GetMapping("/logbook/trips")
    @Operation(summary = "Get vessel's last Logbook trip numbers")
    fun getVesselLogbookVoyages(
        @Parameter(description = "Vessel internal reference number (CFR)", required = true)
        @RequestParam(name = "internalReferenceNumber")
        internalReferenceNumber: String,
    ): List<String> = getVesselTripNumbers.execute(internalReferenceNumber)

    @GetMapping("/logbook/species-control-prefill")
    @Operation(summary = "Get species control pre-fill data from the last logbook trip (FAR and DIS messages)")
    fun getSpeciesControlPrefill(
        @Parameter(description = "Vessel CFR (internal reference number)", required = true)
        @RequestParam(name = "cfr")
        cfr: String,
    ): List<SpeciesControlPrefillDataOutput> =
        getSpeciesControlPrefillFromLogbook.execute(cfr).map {
            SpeciesControlPrefillDataOutput.fromSpeciesControlPrefill(it)
        }

    @GetMapping("/logbook/has-filled-logbook-for-current-trip")
    @Operation(summary = "Has filled logbook for current trip")
    fun getHasFilledLogbookForCurrentTrip(
        @Parameter(description = "Vessel CFR (internal reference number)", required = true)
        @RequestParam(name = "cfr")
        cfr: String,
    ): Boolean = getHasFilledLogbookForCurrentTrip.execute(cfr)

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

    @GetMapping("/contact_method/{vesselId}")
    @Operation(summary = "Get vessel contact method to update from its vessel ID")
    fun getVesselContactToUpdateByVesselId(
        @PathParam("Vessel ID")
        @PathVariable(name = "vesselId")
        vesselId: Int,
    ): ResponseEntity<VesselContactToUpdateDataOutput> {
        val vesselContactToUpdate = getVesselContactToUpdateByVesselId.execute(vesselId)
        return if (vesselContactToUpdate != null) {
            ResponseEntity.ok(fromVesselContactToUpdate(vesselContactToUpdate))
        } else {
            ResponseEntity.noContent().build()
        }
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping(value = ["/contact_method"], consumes = ["application/json"])
    @Operation(summary = "create a vessel contact method")
    fun createVesselContactToUpdate(
        @RequestBody
        vesselContactToUpdate: VesselContactToUpdateDataInput,
    ) {
        saveVesselContactToUpdate.execute(vesselContactToUpdate.toVesselContactToUpdate())
    }

    @PutMapping(value = ["/contact_method"], consumes = ["application/json"])
    @Operation(summary = "update a vessel contact method")
    fun updateVesselContactToUpdate(
        @RequestBody
        vesselContactToUpdate: VesselContactToUpdateDataInput,
    ) {
        saveVesselContactToUpdate.execute(vesselContactToUpdate.toVesselContactToUpdate())
    }
}
