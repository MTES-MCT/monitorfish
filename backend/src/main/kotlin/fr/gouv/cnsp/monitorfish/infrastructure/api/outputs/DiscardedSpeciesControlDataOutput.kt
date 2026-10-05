package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.fasterxml.jackson.annotation.JsonInclude
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.DiscardReason
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.DiscardedSpeciesControl

/**
 * Names are only resolved for public API clients: they are omitted from the BFF output.
 */
data class DiscardedSpeciesControlDataOutput(
    val speciesCode: String,
    @field:JsonInclude(JsonInclude.Include.NON_NULL)
    val speciesName: String? = null,
    val rejectedWeight: Double? = null,
    val discardReason: DiscardReason? = null,
    @field:JsonInclude(JsonInclude.Include.NON_NULL)
    val discardReasonName: String? = null,
    val faoZones: List<String>? = null,
) {
    companion object {
        fun fromDiscardedSpeciesControl(discardedSpeciesControl: DiscardedSpeciesControl) =
            DiscardedSpeciesControlDataOutput(
                speciesCode = discardedSpeciesControl.speciesCode,
                rejectedWeight = discardedSpeciesControl.rejectedWeight,
                discardReason = discardedSpeciesControl.discardReason,
                faoZones = discardedSpeciesControl.faoZones,
            )
    }
}
