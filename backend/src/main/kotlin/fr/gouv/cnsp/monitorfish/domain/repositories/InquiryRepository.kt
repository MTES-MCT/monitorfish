package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.rapportnav.Inquiry
import java.time.ZonedDateTime

interface InquiryRepository {
    fun findAllByVesselId(
        vesselId: Int,
        afterDateTime: ZonedDateTime,
    ): List<Inquiry>
}
