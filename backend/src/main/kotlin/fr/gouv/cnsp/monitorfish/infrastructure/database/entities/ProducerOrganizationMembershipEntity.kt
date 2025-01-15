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
    @Column(name = "joining_date", nullable = false)
    val joiningDate: String,
    @Column(name = "organization_name", nullable = false)
    val organizationName: String,
) {
    fun toProducerOrganizationMembership(): ProducerOrganizationMembership =
        ProducerOrganizationMembership(
            internalReferenceNumber = internalReferenceNumber,
            joiningDate = joiningDate,
            organizationName = organizationName,
        )

    companion object {
        fun fromProducerOrganizationMembership(producerOrganizationMembership: ProducerOrganizationMembership) =
            ProducerOrganizationMembershipEntity(
                internalReferenceNumber = producerOrganizationMembership.internalReferenceNumber,
                joiningDate = producerOrganizationMembership.joiningDate,
                organizationName = producerOrganizationMembership.organizationName,
            )
    }
}
