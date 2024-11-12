package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership

data class ProducerOrganizationMembershipDataOutput(
    /** CFR (Common Fleet Register Number). */
    val internalReferenceNumber: String,
    val startMembershipDate: String,
    val organizationName: String,
) {
    companion object {
        fun fromProducerOrganizationMembership(
            producerOrganizationMembership: ProducerOrganizationMembership,
        ): ProducerOrganizationMembershipDataOutput {
            return ProducerOrganizationMembershipDataOutput(
                internalReferenceNumber = producerOrganizationMembership.internalReferenceNumber,
                startMembershipDate = producerOrganizationMembership.startMembershipDate,
                organizationName = producerOrganizationMembership.organizationName,
            )
        }
    }
}
