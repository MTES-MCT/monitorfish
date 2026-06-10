package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesOnboardControl

data class SpeciesOnboardControlDataInput(
    val speciesCode: String,
    val isNotLanded: Boolean? = null,
    val nbFish: Double?,
    val declaredWeight: Double?,
    val controlledWeight: Double?,
    val underSized: Boolean?,
    val underSizedWeight: Double?,
    val presentationCodes: List<String>?,
    val faoZones: List<String>?,
) {
    fun toSpeciesOnboardControl() =
        SpeciesOnboardControl().also { speciesControl ->
            speciesControl.speciesCode = speciesCode
            speciesControl.isNotLanded = isNotLanded
            speciesControl.nbFish = nbFish
            speciesControl.declaredWeight = declaredWeight
            speciesControl.controlledWeight = controlledWeight
            speciesControl.underSized = underSized
            speciesControl.underSizedWeight = underSizedWeight
            speciesControl.presentationCodes = presentationCodes
            speciesControl.faoZones = faoZones
        }
}
