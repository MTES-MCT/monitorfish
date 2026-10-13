package fr.gouv.cnsp.monitorfish.domain.entities.rapportnav

import java.time.ZonedDateTime
import java.util.UUID

data class Inquiry(
    val id: UUID,
    val vesselId: Int?,
    val type: String?,
    val origin: String?,
    val status: String?,
    val conclusion: String?,
    val startDateTimeUtc: ZonedDateTime?,
    val endDateTimeUtc: ZonedDateTime?,
    val service: InquiryService?,
)

data class InquiryService(
    val id: Int,
    val name: String?,
)
