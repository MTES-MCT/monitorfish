package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas.ComputeVesselFAOAreas
import fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas.GetFAOAreas
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
@WebMvcTest(value = [(FaoAreaController::class)])
class FaoAreaControllerITests {

    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getFAOAreas: GetFAOAreas

    @MockBean
    private lateinit var computeVesselFAOAreas: ComputeVesselFAOAreas

    @Test
    fun `Should get FAO areas`() {
        // Given
        given(this.getFAOAreas.execute()).willReturn(listOf("27.1", "27.1.0", "28.1", "28.1.0", "28.1.1"))

        // When
        api.perform(get("/bff/v1/fao_areas"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(5)))
    }

    @Test
    fun `Should compute FAO areas for a given vessel`() {
        // Given
        given(this.computeVesselFAOAreas.execute(anyOrNull(), anyOrNull(), anyOrNull())).willReturn(
            listOf("27.1", "27.1.0", "28.1", "28.1.0", "28.1.1"),
        )

        // When
        api.perform(get("/bff/v1/fao_areas/compute?internalReferenceNumber=DUMMY_CFR&latitude=12.65&longitude="))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(5)))

        verify(computeVesselFAOAreas).execute(eq("DUMMY_CFR"), eq(12.65), eq(null))
    }
}
