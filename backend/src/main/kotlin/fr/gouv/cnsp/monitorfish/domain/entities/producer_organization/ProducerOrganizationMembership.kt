package fr.gouv.cnsp.monitorfish.domain.entities.producer_organization

data class ProducerOrganizationMembership(
    /** CFR (Common Fleet Register Number). */
    val internalReferenceNumber: String,
    val joiningDate: String,
    val organizationName: String,
)
