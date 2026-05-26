package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.DiscardReason
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesControl

data class SpeciesControlDataInput(
    val speciesCode: String,
    val nbFish: Double?,
    val declaredWeight: Double?,
    val controlledWeight: Double?,
    val underSized: Boolean?,
    val underSizedWeight: Double?,
    val rejectedWeight: Double?,
    val discardReason: DiscardReason?,
    val presentationCode: String?,
    val faoZones: List<String>?,
) {
    fun toSpeciesControl() =
        SpeciesControl().also { speciesControl ->
            speciesControl.speciesCode = speciesCode
            speciesControl.nbFish = nbFish
            speciesControl.declaredWeight = declaredWeight
            speciesControl.controlledWeight = controlledWeight
            speciesControl.underSized = underSized
            speciesControl.underSizedWeight = underSizedWeight
            speciesControl.rejectedWeight = rejectedWeight
            speciesControl.discardReason = discardReason
            speciesControl.presentationCode = presentationCode
            speciesControl.faoZones = faoZones
        }
}
