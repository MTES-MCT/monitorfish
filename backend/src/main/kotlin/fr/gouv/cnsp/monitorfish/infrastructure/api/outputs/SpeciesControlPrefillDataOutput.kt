package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.DiscardReason
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesControlPrefill

data class SpeciesControlPrefillDataOutput(
    val speciesCode: String?,
    val faoZones: List<String>?,
    val presentationCodes: List<String>?,
    val declaredWeight: Double?,
    val rejectedWeight: Double?,
    val discardReason: DiscardReason?,
) {
    companion object {
        fun fromSpeciesControlPrefill(sc: SpeciesControlPrefill) =
            SpeciesControlPrefillDataOutput(
                speciesCode = sc.speciesCode,
                faoZones = sc.faoZones,
                presentationCodes = sc.presentationCodes,
                declaredWeight = sc.declaredWeight,
                rejectedWeight = sc.rejectedWeight,
                discardReason = sc.discardReason,
            )
    }
}
