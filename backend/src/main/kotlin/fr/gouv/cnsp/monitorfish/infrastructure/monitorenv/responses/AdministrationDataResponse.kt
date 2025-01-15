package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.responses

import fr.gouv.cnsp.monitorfish.domain.entities.administration.Administration
import kotlinx.serialization.Serializable

@Serializable
data class AdministrationDataResponse(
    val id: Int,
    val isArchived: Boolean,
    val name: String,
) {
    fun toAdministration(): Administration =
        Administration(
            id = id,
            isArchived = isArchived,
            name = name,
        )
}
