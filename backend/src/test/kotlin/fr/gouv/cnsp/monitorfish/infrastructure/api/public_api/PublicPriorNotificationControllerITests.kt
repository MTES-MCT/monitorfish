package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PdfDocument
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSource
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotificationPdfDocument
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.ZonedDateTime

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(PublicPriorNotificationController::class)])
class PublicPriorNotificationControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getPriorNotificationPdfDocument: GetPriorNotificationPdfDocument

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `getPdf Should get the PDF of a prior notification`() {
        val dummyPdfContent = """
            %PDF-1.4
            1 0 obj
            << /Type /Catalog /Pages 2 0 R >>
            endobj
            2 0 obj
            << /Type /Pages /Kids [3 0 R] /Count 1 >>
            endobj
            3 0 obj
            << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
            endobj
            4 0 obj
            << /Length 55 >>
            stream
            BT
            /F1 24 Tf
            100 700 Td
            (Hello, World!) Tj
            ET
            endstream
            endobj
            xref
            0 5
            0000000000 65535 f
            0000000010 00000 n
            0000000062 00000 n
            0000000113 00000 n
            0000000218 00000 n
            trailer
            << /Size 5 /Root 1 0 R >>
            startxref
            291
            %%EOF
        """.trimIndent().toByteArray()

        // Given
        given(getPriorNotificationPdfDocument.execute("REPORT_ID", false))
            .willReturn(
                PdfDocument(
                    reportId = "REPORT_ID",
                    source = PriorNotificationSource.LOGBOOK,
                    generationDatetimeUtc = ZonedDateTime.now(),
                    pdfDocument = dummyPdfContent,
                ),
            )

        // When
        api.perform(get("/api/v1/prior_notifications/pdf/REPORT_ID"))
            // Then
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_PDF))
            .andExpect(content().bytes(dummyPdfContent))
    }

    @Test
    fun `getPdfExistence Should get the PDF existence of a prior notification`() {
        // Given
        given(getPriorNotificationPdfDocument.execute("REPORT_ID", true)).willReturn(null)

        // When
        api.perform(get("/api/v1/prior_notifications/pdf/REPORT_ID/exist"))
            // Then
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status", equalTo("NO_CONTENT")))
    }
}
