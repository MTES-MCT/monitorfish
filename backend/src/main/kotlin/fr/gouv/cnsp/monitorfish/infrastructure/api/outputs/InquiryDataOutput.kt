package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.rapportnav.Inquiry
import fr.gouv.cnsp.monitorfish.domain.entities.rapportnav.InquiryInfraction
import fr.gouv.cnsp.monitorfish.domain.entities.rapportnav.InquiryService
import java.time.ZonedDateTime
import java.util.UUID

data class InquiryDataOutput(
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
    val service: InquiryServiceDataOutput?,
    val infractions: List<InquiryInfractionDataOutput>,
    val observations: List<String>,
    val controlUnits: List<LegacyControlUnit>,
) {
    companion object {
        fun fromInquiry(inquiry: Inquiry) =
            InquiryDataOutput(
                id = inquiry.id,
                vesselId = inquiry.vesselId,
                missionId = inquiry.missionId,
                type = inquiry.type,
                origin = inquiry.origin,
                status = inquiry.status,
                conclusion = inquiry.conclusion,
                startDateTimeUtc = inquiry.startDateTimeUtc,
                endDateTimeUtc = inquiry.endDateTimeUtc,
                isSignedByInspector = inquiry.isSignedByInspector,
                service = inquiry.service?.let { InquiryServiceDataOutput.fromInquiryService(it) },
                infractions = inquiry.infractions.map { InquiryInfractionDataOutput.fromInquiryInfraction(it) },
                observations = inquiry.observations,
                controlUnits = inquiry.controlUnits,
            )
    }
}

data class InquiryServiceDataOutput(
    val id: Int,
    val name: String?,
    val controlUnitIds: List<Int>,
) {
    companion object {
        fun fromInquiryService(service: InquiryService) =
            InquiryServiceDataOutput(
                id = service.id,
                name = service.name,
                controlUnitIds = service.controlUnitIds,
            )
    }
}

data class InquiryInfractionDataOutput(
    val controlType: String?,
    val infractionType: String?,
    val natinfs: List<String>,
    val observations: String?,
) {
    companion object {
        fun fromInquiryInfraction(infraction: InquiryInfraction) =
            InquiryInfractionDataOutput(
                controlType = infraction.controlType,
                infractionType = infraction.infractionType,
                natinfs = infraction.natinfs,
                observations = infraction.observations,
            )
    }
}
