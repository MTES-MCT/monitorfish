package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos.FullControlUnit

data class ControlUnitDataOutput(
    val id: Int,
    val administration: AdministrationDataOutput,
    val name: String,
) {
    companion object {
        fun fromFullControlUnit(fullControlUnit: FullControlUnit): ControlUnitDataOutput {
            val administration = AdministrationDataOutput.fromAdministration(fullControlUnit.administration)

            return ControlUnitDataOutput(
                id = fullControlUnit.id,
                administration,
                name = fullControlUnit.name,
            )
        }
    }
}
