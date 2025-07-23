package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.use_cases.activity.GetActivityVisualizationFile
import fr.gouv.cnsp.monitorfish.infrastructure.api.ControllersExceptionHandler
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(SentryConfig::class, ControllersExceptionHandler::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [ActivityVisualizationController::class])
class ActivityVisualizationControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getActivityVisualizationFile: GetActivityVisualizationFile

    @Test
    fun `Should get activity visualization file`() {
        // Given
        given(getActivityVisualizationFile.execute()).willReturn("""
            <html>
            </html>
        """.trimIndent())

        // When
        api
            .perform(get("/bff/v1/activity_visualization"))
            // Then
            .andExpect(status().isOk)
            .andExpect(content().string("""
            <html>
            </html>
        """.trimIndent()))
    }
}
