package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaProducerOrganizationMembershipRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaProducerOrganizationMembership: JpaProducerOrganizationMembership

    @Test
    @Transactional
    fun `findAll Should return all producer organization memberships`() {
        // When
        val memberships = jpaProducerOrganizationMembership.findAll()

        // Then
        assertThat(memberships).hasSize(12)
        assertThat(memberships.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(memberships.first().joiningDate).isEqualTo("14/03/2015")
        assertThat(memberships.first().organizationName).isEqualTo("SA THO AN")
    }

    @Test
    @Transactional
    fun `saveAll Should return all producer organization memberships`() {
        // Given
        val newMembership =
            listOf(
                ProducerOrganizationMembership(
                    "CFR10215",
                    "01/01/2024",
                    "OP OK",
                ),
                ProducerOrganizationMembership(
                    "CFR10216",
                    "01/01/2025",
                    "OP OKA",
                ),
            )

        // When
        jpaProducerOrganizationMembership.saveAll(newMembership)

        // Then
        val membership = jpaProducerOrganizationMembership.findByInternalReferenceNumber("CFR10215")
        assertThat(membership.joiningDate).isEqualTo("01/01/2024")
        assertThat(membership.organizationName).isEqualTo("OP OK")
    }
}
