package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import java.time.ZonedDateTime

data class PdfDocument(
    val reportId: String,
    val source: PriorNotificationSource,
    val generationDatetimeUtc: ZonedDateTime,
    val pdfDocument: ByteArray?
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as PdfDocument

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
