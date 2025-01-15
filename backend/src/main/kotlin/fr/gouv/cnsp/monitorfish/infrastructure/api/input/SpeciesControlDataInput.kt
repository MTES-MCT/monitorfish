package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesControl

data class SpeciesControlDataInput(
    val speciesCode: String,
    val nbFish: Double?,
    val declaredWeight: Double?,
    val controlledWeight: Double?,
    val underSized: Boolean?,
) {
    fun toSpeciesControl() =
        SpeciesControl().also { speciesControl ->
            speciesControl.speciesCode = speciesCode
            speciesControl.nbFish = nbFish
            speciesControl.declaredWeight = declaredWeight
            speciesControl.controlledWeight = controlledWeight
            speciesControl.underSized = underSized
        }
}
