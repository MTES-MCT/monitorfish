package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.responses

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlResource
import kotlinx.serialization.Serializable

@Serializable
data class LegacyControlUnitDataResponse(
    val id: Int,
    val administration: String,
    val isArchived: Boolean,
    val name: String,
    val resources: List<ControlResource>,
    val contact: String? = null,
) {
    fun toLegacyControlUnit(): LegacyControlUnit {
        return LegacyControlUnit(
            id = id,
            administration = administration,
            isArchived = isArchived,
            name = name,
            resources = resources,
            contact = contact,
        )
    }
}
