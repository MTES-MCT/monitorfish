package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.ArchiveReporting
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(SecurityConfig::class, OIDCProperties::class, SentryConfig::class)
@WebMvcTest(value = [PublicReportingController::class])
class PublicReportingControllerITests {

    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var archiveReporting: ArchiveReporting

    @Test
    fun `Should archive a reporting`() {
        // When
        api.perform(put("/api/v1/reportings/123/archive"))
            // Then
            .andExpect(status().isOk)

        Mockito.verify(archiveReporting).execute(123)
    }
}
