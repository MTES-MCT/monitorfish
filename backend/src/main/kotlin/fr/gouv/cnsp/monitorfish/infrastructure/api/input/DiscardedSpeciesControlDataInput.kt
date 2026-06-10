package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.DiscardReason
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.DiscardedSpeciesControl

data class DiscardedSpeciesControlDataInput(
    val speciesCode: String,
    val rejectedWeight: Double?,
    val discardReason: DiscardReason?,
    val faoZones: List<String>?,
) {
    fun toDiscardedSpeciesControl() =
        DiscardedSpeciesControl(
            speciesCode = speciesCode,
            rejectedWeight = rejectedWeight,
            discardReason = discardReason,
            faoZones = faoZones,
        )
}
