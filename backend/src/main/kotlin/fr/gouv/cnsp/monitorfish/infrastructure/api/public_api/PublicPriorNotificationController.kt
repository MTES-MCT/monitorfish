package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotificationPdfDocument
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.format.DateTimeFormatter.ISO_DATE_TIME

@RestController
@RequestMapping("/api/v1/prior_notifications")
@Tag(name = "Prior notifications endpoints")
class PublicPriorNotificationController(
    private val getPriorNotificationPdfDocument: GetPriorNotificationPdfDocument,
) {
    // FIXME Move this API to `/bff`
    @GetMapping("/pdf/{reportId}")
    @Operation(summary = "Get the PDF document")
    fun getPdfDocument(
        @PathParam("Logbook message `reportId`")
        @PathVariable(name = "reportId")
        reportId: String,
    ): ResponseEntity<ByteArray?> {
        val pdfDocument = getPriorNotificationPdfDocument.execute(reportId = reportId)
        if (pdfDocument.pdfDocument == null) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(null)
        }

        val fileName = "preavis_debarquement_${pdfDocument.generationDatetimeUtc.format(ISO_DATE_TIME)}.pdf"
        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_PDF
            setContentDispositionFormData(
                "attachment",
                fileName,
            )
        }

        return ResponseEntity(pdfDocument.pdfDocument, headers, HttpStatus.OK)
    }
}
