package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnitContact
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos.FullControlUnit

data class PublicControlUnitDataOutput(
    val id: Int,
    val administration: AdministrationDataOutput,
    val controlUnitContacts: List<PublicControlUnitContactDataOutput>,
    val isArchived: Boolean,
    val name: String,
) {
    companion object {
        fun fromFullControlUnit(fullControlUnit: FullControlUnit): PublicControlUnitDataOutput =
            PublicControlUnitDataOutput(
                id = fullControlUnit.id,
                administration = AdministrationDataOutput.fromAdministration(fullControlUnit.administration),
                controlUnitContacts =
                    fullControlUnit.controlUnitContacts.map {
                        PublicControlUnitContactDataOutput.fromControlUnitContact(it)
                    },
                isArchived = fullControlUnit.isArchived,
                name = fullControlUnit.name,
            )
    }
}

data class PublicControlUnitContactDataOutput(
    val email: String?,
    val isEmailSubscriptionContact: Boolean,
    val isSmsSubscriptionContact: Boolean,
    val phone: String?,
) {
    companion object {
        fun fromControlUnitContact(controlUnitContact: ControlUnitContact): PublicControlUnitContactDataOutput =
            PublicControlUnitContactDataOutput(
                email = controlUnitContact.email,
                isEmailSubscriptionContact = controlUnitContact.isEmailSubscriptionContact,
                isSmsSubscriptionContact = controlUnitContact.isSmsSubscriptionContact,
                phone = controlUnitContact.phone,
            )
    }
}
