package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PdfDocument
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSource
import jakarta.persistence.*
import org.hibernate.annotations.JdbcType
import org.hibernate.dialect.PostgreSQLEnumJdbcType
import java.time.ZonedDateTime

@Entity
@Table(name = "prior_notification_pdf_documents")
data class PriorNotificationPdfDocumentEntity(
    @Id
    @Column(name = "report_id")
    val reportId: String,
    @Column(name = "source", columnDefinition = "prior_notification_source")
    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType::class)
    val source: PriorNotificationSource,
    @Column(name = "generation_datetime_utc")
    val generationDatetimeUtc: ZonedDateTime,
    @Column(name = "pdf_document")
    val pdfDocument: ByteArray?,
) {

    fun toPdfDocument() = PdfDocument(
        reportId = reportId,
        source = source,
        generationDatetimeUtc = generationDatetimeUtc,
        pdfDocument = pdfDocument,
    )

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as PriorNotificationPdfDocumentEntity

        if (reportId != other.reportId) return false
        if (source != other.source) return false
        if (generationDatetimeUtc != other.generationDatetimeUtc) return false
        if (pdfDocument != null) {
            if (other.pdfDocument == null) return false
            if (!pdfDocument.contentEquals(other.pdfDocument)) return false
        } else if (other.pdfDocument != null) return false

        return true
    }

    override fun hashCode(): Int {
        var result = reportId.hashCode()
        result = 31 * result + source.hashCode()
        result = 31 * result + generationDatetimeUtc.hashCode()
        result = 31 * result + (pdfDocument?.contentHashCode() ?: 0)
        return result
    }
}
