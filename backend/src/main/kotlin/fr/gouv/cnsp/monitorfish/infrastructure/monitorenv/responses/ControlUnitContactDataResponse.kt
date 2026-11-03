package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.responses

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnitContact
import kotlinx.serialization.Serializable

@Serializable
data class ControlUnitContactDataResponse(
    val id: Int,
    val cellPhone: String?,
    val controlUnitId: Int,
    val email: String?,
    val isEmailSubscriptionContact: Boolean,
    val isSmsSubscriptionContact: Boolean,
    val name: String,
    val phone: String?,
    val role: String?,
) {
    fun toControlUnitContact(): ControlUnitContact =
        ControlUnitContact(
            id = id,
            cellPhone = cellPhone,
            controlUnitId = controlUnitId,
            email = email,
            isEmailSubscriptionContact = isEmailSubscriptionContact,
            isSmsSubscriptionContact = isSmsSubscriptionContact,
            name = name,
            phone = phone,
            role = role,
        )
}
