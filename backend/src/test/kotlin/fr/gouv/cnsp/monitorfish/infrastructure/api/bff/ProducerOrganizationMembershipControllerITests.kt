package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.whenever
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.use_cases.producer_organization_membership.GetAllProducerOrganizationMemberships
import fr.gouv.cnsp.monitorfish.domain.use_cases.producer_organization_membership.GetDistinctProducerOrganizations
import fr.gouv.cnsp.monitorfish.domain.use_cases.producer_organization_membership.SetProducerOrganizationMemberships
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(ProducerOrganizationMembershipController::class)
class ProducerOrganizationMembershipControllerITests {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockitoBean
    private lateinit var setProducerOrganizationMemberships: SetProducerOrganizationMemberships

    @MockitoBean
    private lateinit var getAllProducerOrganizationMemberships: GetAllProducerOrganizationMemberships

    @MockitoBean
    private lateinit var getDistinctProducerOrganizations: GetDistinctProducerOrganizations

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should return all producer organization memberships`() {
        // Given
        val memberships =
            listOf(
                ProducerOrganizationMembership("123", "01/10/2024", "Example Name 1"),
                ProducerOrganizationMembership("456", "01/10/2024", "Example Name 2"),
            )
        whenever(getAllProducerOrganizationMemberships.execute()).thenReturn(memberships)

        // When Then
        mockMvc
            .perform(get("/bff/v1/producer_organization_memberships"))
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$[0].internalReferenceNumber").value("123"))
            .andExpect(jsonPath("$[1].internalReferenceNumber").value("456"))
    }

    @Test
    fun `Should create new producer organization memberships`() {
        // Given
        val memberships =
            listOf(
                ProducerOrganizationMembership("123", "01/10/2024", "Example Name 1"),
                ProducerOrganizationMembership("456", "01/10/2024", "Example Name 2"),
            )

        // When Then
        mockMvc
            .perform(
                post("/bff/v1/producer_organization_memberships")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(memberships)),
            ).andExpect(status().isCreated)
    }

    @Test
    fun `Should return distinct producer organization`() {
        // Given
        whenever(getDistinctProducerOrganizations.execute()).thenReturn(listOf("OP_NORD", "OP"))

        // When Then
        mockMvc
            .perform(get("/bff/v1/producer_organization_memberships/distinct"))
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$[0]").value("OP_NORD"))
            .andExpect(jsonPath("$[1]").value("OP"))
    }
}
