package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.toPortDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.ReferentialSnapshots
import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.VersionedReferential
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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(
    MapperConfiguration::class,
    SentryConfig::class,
)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(PortController::class)])
class PortControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var referentialSnapshots: ReferentialSnapshots

    @Test
    fun `Should get all active ports`() {
        // Given
        given(this.referentialSnapshots.ports()).willReturn(
            VersionedReferential(
                listOf(
                    PortFaker.fakePort(locode = "ET", name = "Etel", latitude = 47.123, longitude = 0.123),
                    PortFaker.fakePort(locode = "AY", name = "Auray"),
                ).map { it.toPortDataOutput() },
                "a1b2",
            ),
        )

        // When
        api
            .perform(get("/bff/v1/ports?v=a1b2"))
            // Then
            .andExpect(status().isOk)
            .andExpect(header().string("Cache-Control", "max-age=31536000, private, immutable"))
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].locode", equalTo("ET")))
            .andExpect(jsonPath("$[0].name", equalTo("Etel")))
            .andExpect(jsonPath("$[0].latitude", equalTo(47.123)))
            .andExpect(jsonPath("$[0].longitude", equalTo(0.123)))
    }
}
