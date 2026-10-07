package fr.gouv.cnsp.monitorfish.infrastructure.api.contract

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonUnwrapped
import java.time.ZonedDateTime

/**
 * Public ISR API output: the shared [MissionActionDataOutput] flattened via [JsonUnwrapped], plus
 * vessel attributes and JPE / logbook data that are only exposed on `/api` (not `/bff`).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
data class PublicMissionActionDataOutput(
    @JsonUnwrapped
    val missionAction: MissionActionDataOutput,
    // Vessel (from the `vessels` table, via vesselId)
    val vesselLength: Double? = null,
    val vesselType: String? = null,
    val imo: String? = null,
    val proprietorName: String? = null,
    val proprietorPhones: List<String>? = null,
    val proprietorEmails: List<String>? = null,
    val proprietorNationality: String? = null,
    val proprietorAddress: String? = null,
    val chartererName: String? = null,
    val chartererPhones: List<String>? = null,
    val chartererEmail: String? = null,
    val chartererNationality: String? = null,
    val chartererAddress: String? = null,
    // JPE (logbook / ERS data for the trip current at the control date)
    val tripNumber: String? = null,
    val pnoReportId: String? = null,
    val pnoPurpose: LogbookMessagePurpose? = null,
    val lastDeparturePortLocode: String? = null,
    val lastDeparturePortName: String? = null,
    val lastDepartureDateTime: ZonedDateTime? = null,
)
