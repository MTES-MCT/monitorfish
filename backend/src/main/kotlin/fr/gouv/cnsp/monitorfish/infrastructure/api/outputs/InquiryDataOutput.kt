package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.rapportnav.Inquiry
import java.time.ZonedDateTime
import java.util.UUID

data class InquiryDataOutput(
    val id: UUID,
    val vesselId: Int?,
    val type: String?,
    val origin: String?,
    val status: String?,
    val conclusion: String?,
    val startDateTimeUtc: ZonedDateTime?,
    val endDateTimeUtc: ZonedDateTime?,
    val service: InquiryServiceDataOutput?,
) {
    companion object {
        fun fromInquiry(inquiry: Inquiry) =
            InquiryDataOutput(
                id = inquiry.id,
                vesselId = inquiry.vesselId,
                type = inquiry.type,
                origin = inquiry.origin,
                status = inquiry.status,
                conclusion = inquiry.conclusion,
                startDateTimeUtc = inquiry.startDateTimeUtc,
                endDateTimeUtc = inquiry.endDateTimeUtc,
                service = inquiry.service?.let { InquiryServiceDataOutput(id = it.id, name = it.name) },
            )
    }
}

data class InquiryServiceDataOutput(
    val id: Int,
    val name: String?,
)
