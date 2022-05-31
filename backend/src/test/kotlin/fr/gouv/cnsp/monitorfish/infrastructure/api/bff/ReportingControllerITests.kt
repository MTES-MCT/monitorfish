package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.ArchiveReporting
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.DeleteReporting
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@ExtendWith(SpringExtension::class)
@WebMvcTest(value = [(ReportingController::class)])
class ReportingControllerITests {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var archiveReporting: ArchiveReporting

    @MockBean
    private lateinit var deleteReporting: DeleteReporting

    @Test
    fun `Should archive a reporting`() {
        // When
        mockMvc.perform(put("/bff/v1/reporting/123/archive"))
                // Then
                .andExpect(status().isOk)

        Mockito.verify(archiveReporting).execute(123)
    }

    @Test
    fun `Should delete a reporting`() {
        // When
        mockMvc.perform(put("/bff/v1/reporting/123/delete"))
                // Then
                .andExpect(status().isOk)

        Mockito.verify(deleteReporting).execute(123)
    }

}
