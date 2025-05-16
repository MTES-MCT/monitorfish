package fr.gouv.cnsp.monitorfish.infrastructure.api.light

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVessel
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselVoyage
import fr.gouv.cnsp.monitorfish.infrastructure.api.light.outputs.VesselAndPositionsDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.light.outputs.VoyageDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import kotlinx.coroutines.runBlocking
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.ZonedDateTime

@RestController
@RequestMapping("/light/v1/vessels")
@Tag(name = "APIs for Vessels in light mode")
class VesselLightController(
    private val getVessel: GetVessel,
    private val getVesselVoyage: GetVesselVoyage,
) {
    companion object {
        const val zoneDateTimePattern = "yyyy-MM-dd'T'HH:mm:ss.000X"
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
    ): ResponseEntity<VesselAndPositionsDataOutput> =
        runBlocking {
            val (vesselTrackHasBeenModified, vesselWithData) =
                getVessel.execute(
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
}
