package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllControlUnits
import fr.gouv.cnsp.monitorfish.fakers.FullControlUnitFaker
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(MapperConfiguration::class, SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [PublicControlUnitController::class])
class PublicControlUnitControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var getAllControlUnits: GetAllControlUnits

    @Test
    fun `Should get all control units with their contacts`() {
        // Given
        given(this.getAllControlUnits.execute()).willReturn(
            listOf(FullControlUnitFaker.fakeFullControlUnit(id = 10, name = "Unité 10", isArchived = true)),
        )

        // When
        api
            .perform(get("/api/v1/control_units"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].id", equalTo(10)))
            .andExpect(jsonPath("$[0].name", equalTo("Unité 10")))
            .andExpect(jsonPath("$[0].isArchived", equalTo(true)))
            .andExpect(jsonPath("$[0].administration.name", equalTo("Fake Administration Name")))
            .andExpect(jsonPath("$[0].controlUnitContacts[0].email", equalTo("contact@example.com")))
            .andExpect(jsonPath("$[0].controlUnitContacts[0].phone", equalTo("+1234567890")))
            .andExpect(jsonPath("$[0].controlUnitContacts[0].isEmailSubscriptionContact", equalTo(true)))
            .andExpect(jsonPath("$[0].controlUnitContacts[0].isSmsSubscriptionContact", equalTo(false)))
    }
}
