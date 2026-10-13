package fr.gouv.cnsp.monitorfish.infrastructure.rapportnav.responses

import fr.gouv.cnsp.monitorfish.domain.entities.rapportnav.Inquiry
import fr.gouv.cnsp.monitorfish.domain.entities.rapportnav.InquiryService
import fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.responses.UUIDSerializer
import kotlinx.serialization.Serializable
import java.time.ZonedDateTime
import java.util.UUID

@Serializable
data class InquiryDataResponse(
    @Serializable(with = UUIDSerializer::class)
    val id: UUID,
    val vesselId: Int? = null,
    val type: String? = null,
    val origin: String? = null,
    val status: String? = null,
    val conclusion: String? = null,
    val startDateTimeUtc: String? = null,
    val endDateTimeUtc: String? = null,
    val service: InquiryServiceDataResponse? = null,
) {
    fun toInquiry() =
        Inquiry(
            id = id,
            vesselId = vesselId,
            type = type,
            origin = origin,
            status = status,
            conclusion = conclusion,
            startDateTimeUtc = startDateTimeUtc?.let { ZonedDateTime.parse(it) },
            endDateTimeUtc = endDateTimeUtc?.let { ZonedDateTime.parse(it) },
            service = service?.let { InquiryService(id = it.id, name = it.name) },
        )
}

@Serializable
data class InquiryServiceDataResponse(
    val id: Int,
    val name: String? = null,
)
