package fr.gouv.cnsp.monitorfish.domain.use_cases.producer_organization_membership

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.repositories.ProducerOrganizationMembershipRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetDistinctProducerOrganizationsUTests {
    @MockitoBean
    private lateinit var producerOrganizationMembershipRepository: ProducerOrganizationMembershipRepository

    @Test
    fun `execute Should return distinct OPs`() {
        // Given
        val memberships =
            listOf(
                ProducerOrganizationMembership("123", "01/10/2024", "Example Name 1"),
                ProducerOrganizationMembership("456", "01/10/2024", "Example Name 2"),
                ProducerOrganizationMembership("456", "01/10/2024", "Example Name 1"),
            )
        given(producerOrganizationMembershipRepository.findAll()).willReturn(memberships)

        // When
        val distinctOPs = GetDistinctProducerOrganizations(producerOrganizationMembershipRepository).execute()

        // Then
        assertThat(distinctOPs).isEqualTo(listOf("Example Name 1", "Example Name 2"))
    }
}
