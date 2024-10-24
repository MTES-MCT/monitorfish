package fr.gouv.cnsp.monitorfish.domain.entities.control_unit

import kotlinx.serialization.Serializable

@Serializable
data class ControlUnitContact(
    val id: Int,
    val controlUnitId: Int,
    val email: String?,
    val isEmailSubscriptionContact: Boolean,
    val isSmsSubscriptionContact: Boolean,
    val name: String,
    val phone: String?,
)
