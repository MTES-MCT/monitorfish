package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership

data class ProducerOrganizationMembershipDataInput(
    /** CFR (Common Fleet Register Number). */
    val internalReferenceNumber: String,
    val startMembershipDate: String,
    val organizationName: String,
) {
    fun toProducerOrganizationMembership(): ProducerOrganizationMembership =
        ProducerOrganizationMembership(
            internalReferenceNumber = internalReferenceNumber,
            startMembershipDate = startMembershipDate,
            organizationName = organizationName,
        )
}
