package fr.gouv.cnsp.monitorfish.infrastructure.rapportnav.responses

import fr.gouv.cnsp.monitorfish.domain.entities.rapportnav.Inquiry
import fr.gouv.cnsp.monitorfish.domain.entities.rapportnav.InquiryInfraction
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
    val missionId: Int? = null,
    val type: String? = null,
    val origin: String? = null,
    val status: String? = null,
    val conclusion: String? = null,
    val startDateTimeUtc: String? = null,
    val endDateTimeUtc: String? = null,
    val isSignedByInspector: Boolean? = null,
    val service: InquiryServiceDataResponse? = null,
    val infractions: List<InquiryInfractionDataResponse> = listOf(),
    val observations: List<String> = listOf(),
) {
    fun toInquiry() =
        Inquiry(
            id = id,
            vesselId = vesselId,
            missionId = missionId,
            type = type,
            origin = origin,
            status = status,
            conclusion = conclusion,
            startDateTimeUtc = startDateTimeUtc?.let { ZonedDateTime.parse(it) },
            endDateTimeUtc = endDateTimeUtc?.let { ZonedDateTime.parse(it) },
            isSignedByInspector = isSignedByInspector,
            service = service?.toInquiryService(),
            infractions = infractions.map { it.toInquiryInfraction() },
            observations = observations,
        )
}

@Serializable
data class InquiryServiceDataResponse(
    val id: Int,
    val name: String? = null,
    val controlUnitIds: List<Int> = listOf(),
) {
    fun toInquiryService() = InquiryService(id = id, name = name, controlUnitIds = controlUnitIds)
}

@Serializable
data class InquiryInfractionDataResponse(
    val controlType: String? = null,
    val infractionType: String? = null,
    val natinfs: List<String> = listOf(),
    val observations: String? = null,
) {
    fun toInquiryInfraction() =
        InquiryInfraction(
            controlType = controlType,
            infractionType = infractionType,
            natinfs = natinfs,
            observations = observations,
        )
}
