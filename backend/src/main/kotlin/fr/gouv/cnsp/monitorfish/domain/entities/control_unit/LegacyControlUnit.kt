package fr.gouv.cnsp.monitorfish.domain.entities.control_units

import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlResource
import kotlinx.serialization.Serializable

@Serializable
data class LegacyControlUnit(
    val id: Int,
    val administration: String,
    val isArchived: Boolean,
    val name: String,
    val resources: List<ControlResource>,
    val contact: String? = null,
)
