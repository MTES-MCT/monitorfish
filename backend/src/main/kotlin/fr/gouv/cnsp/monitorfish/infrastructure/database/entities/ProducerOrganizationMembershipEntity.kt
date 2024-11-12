package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "producer_organization_memberships")
data class ProducerOrganizationMembershipEntity(
    @Id
    @Column(name = "internal_reference_number", nullable = false)
    val internalReferenceNumber: String,
    @Column(name = "start_membership_date", nullable = false)
    val startMembershipDate: String,
    @Column(name = "organization_name", nullable = false)
    val organizationName: String,
) {
    fun toProducerOrganizationMembership(): ProducerOrganizationMembership {
        return ProducerOrganizationMembership(
            internalReferenceNumber = internalReferenceNumber,
            startMembershipDate = startMembershipDate,
            organizationName = organizationName,
        )
    }

    companion object {
        fun fromProducerOrganizationMembership(producerOrganizationMembership: ProducerOrganizationMembership) =
            ProducerOrganizationMembershipEntity(
                internalReferenceNumber = producerOrganizationMembership.internalReferenceNumber,
                startMembershipDate = producerOrganizationMembership.startMembershipDate,
                organizationName = producerOrganizationMembership.organizationName,
            )
    }
}
