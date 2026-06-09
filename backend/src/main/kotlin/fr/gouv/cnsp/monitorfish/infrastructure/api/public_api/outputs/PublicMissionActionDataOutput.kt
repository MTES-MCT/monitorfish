package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.outputs

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonUnwrapped
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.EnrichedMissionAction
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.MissionActionDataOutput
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
    // JPE (logbook / ERS data for the trip current at the control date)
    val tripNumber: String? = null,
    val pnoReportId: String? = null,
    val pnoPurpose: LogbookMessagePurpose? = null,
    val lastDeparturePortLocode: String? = null,
    val lastDeparturePortName: String? = null,
    val lastDepartureDateTime: ZonedDateTime? = null,
) {
    companion object {
        fun fromEnriched(enriched: EnrichedMissionAction) =
            PublicMissionActionDataOutput(
                missionAction =
                    MissionActionDataOutput.fromMissionAction(
                        missionAction = enriched.missionAction,
                        useThreatHierarchyForForm = false,
                    ),
                vesselLength = enriched.vessel?.length,
                vesselType = enriched.vessel?.vesselType,
                imo = enriched.vessel?.imo,
                tripNumber = enriched.tripNumber,
                pnoReportId = enriched.pnoReportId,
                pnoPurpose = enriched.pnoPurpose,
                lastDeparturePortLocode = enriched.lastDeparturePortLocode,
                lastDeparturePortName = enriched.lastDeparturePortName,
                lastDepartureDateTime = enriched.lastDepartureDateTime,
            )
    }
}
