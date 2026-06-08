package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.DiscardReason
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesControl

data class SpeciesControlPrefillDataOutput(
    val speciesCode: String?,
    val faoZones: List<String>?,
    val presentationCodes: List<String>?,
    val rejectedWeight: Double?,
    val discardReason: DiscardReason?,
) {
    companion object {
        fun fromSpeciesControl(sc: SpeciesControl) =
            SpeciesControlPrefillDataOutput(
                speciesCode = sc.speciesCode,
                faoZones = sc.faoZones,
                presentationCodes = sc.presentationCodes,
                rejectedWeight = sc.rejectedWeight,
                discardReason = sc.discardReason,
            )
    }
}
