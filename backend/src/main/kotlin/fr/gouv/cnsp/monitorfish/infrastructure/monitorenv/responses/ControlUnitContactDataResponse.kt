package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.responses

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnitContact
import kotlinx.serialization.Serializable

@Serializable
data class ControlUnitContactDataResponse(
    val id: Int,
    val controlUnitId: Int,
    val email: String?,
    val isEmailSubscriptionContact: Boolean,
    val isSmsSubscriptionContact: Boolean,
    val name: String,
    val phone: String?,
) {
    fun toControlUnitContact(): ControlUnitContact =
        ControlUnitContact(
            id = id,
            controlUnitId = controlUnitId,
            email = email,
            isEmailSubscriptionContact = isEmailSubscriptionContact,
            isSmsSubscriptionContact = isSmsSubscriptionContact,
            name = name,
            phone = phone,
        )
}
