package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.ReferentialSnapshots
import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.VersionedReferential
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(
    MapperConfiguration::class,
    SentryConfig::class,
)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(RegulationController::class)])
class RegulationControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var referentialSnapshots: ReferentialSnapshots

    @Test
    fun `Should get the regulatory zones catalogue as JSON`() {
        // Given
        given(this.referentialSnapshots.regulations()).willReturn(
            VersionedReferential(
                """{"type" : "FeatureCollection", "features" : [{"type" : "Feature", "id" : "regulations.1", """ +
                    """"geometry" : null, "properties" : {"id" : 1, "topic" : "Chaluts de fond (non spécifiés)"}}]}""",
                "a1b2",
            ),
        )

        // When
        api
            .perform(get("/bff/v1/regulations/catalogue?v=a1b2"))
            // Then
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(header().string("Cache-Control", "max-age=31536000, private, immutable"))
            .andExpect(jsonPath("$.features.length()", equalTo(1)))
            .andExpect(jsonPath("$.features[0].properties.topic", equalTo("Chaluts de fond (non spécifiés)")))
    }
}
