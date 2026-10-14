package fr.gouv.cnsp.monitorfish.domain.entities.rapportnav

import java.time.ZonedDateTime
import java.util.UUID

data class Inquiry(
    val id: UUID,
    val vesselId: Int?,
    val missionId: Int?,
    val type: String?,
    val origin: String?,
    val status: String?,
    val conclusion: String?,
    val startDateTimeUtc: ZonedDateTime?,
    val endDateTimeUtc: ZonedDateTime?,
    val isSignedByInspector: Boolean?,
    val service: InquiryService?,
    val infractions: List<InquiryInfraction>,
    val observations: List<String>,
)

data class InquiryService(
    val id: Int,
    val name: String?,
    val controlUnitIds: List<Int>,
)

data class InquiryInfraction(
    val controlType: String?,
    val infractionType: String?,
    val natinfs: List<String>,
    val observations: String?,
)
