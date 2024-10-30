package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.administration.Administration

data class AdministrationDataOutput(
    val id: Int,
    val name: String,
) {
    companion object {
        fun fromAdministration(administration: Administration): AdministrationDataOutput {
            return AdministrationDataOutput(
                id = administration.id,
                name = administration.name,
            )
        }
    }
}
