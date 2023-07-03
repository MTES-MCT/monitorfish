package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.ForeignFMC
import fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction.GetAllForeignFMCs
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(SecurityConfig::class, OIDCProperties::class, SentryConfig::class)
@WebMvcTest(value = [(ForeignFMCsController::class)])
class ForeignFMCsControllerITests {

    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getAllForeignFMCs: GetAllForeignFMCs

    @Test
    fun `Should return all foreign FMCs`() {
        // Given
        given(getAllForeignFMCs.execute()).willReturn(
            listOf(
                ForeignFMC("ABC", "Alabama", listOf("email1@some.domaina", "email2@other.domain")),
                ForeignFMC("DEF", "Dumbo", null),
            ),
        )

        // When
        api.perform(get("/bff/v1/foreign_fmcs"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].countryCodeIso3", equalTo("ABC")))
            .andExpect(jsonPath("$[0].countryName", equalTo("Alabama")))
            .andExpect(jsonPath("$[0].emailAddresses", equalTo(listOf("email1@some.domaina", "email2@other.domain"))))
            .andExpect(jsonPath("$[1].countryCodeIso3", equalTo("DEF")))
            .andExpect(jsonPath("$[1].countryName", equalTo("Dumbo")))
            .andExpect(jsonPath("$[1].emailAddresses", equalTo(null)))
    }
}
