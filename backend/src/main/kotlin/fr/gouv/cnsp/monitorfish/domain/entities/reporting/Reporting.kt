package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

data class Reporting(
    val id: Int? = null,
    val type: ReportingType,
    val vesselId: Int? = null,
    val vesselName: String? = null,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val vesselIdentifier: VesselIdentifier? = null,
    val flagState: CountryCode,
    val creationDate: ZonedDateTime,
    val validationDate: ZonedDateTime? = null,
    val expirationDate: ZonedDateTime? = null,
    val archivingDate: ZonedDateTime? = null,
    val value: ReportingContent,
    val isArchived: Boolean,
    val isDeleted: Boolean,
    val latitude: Double? = null,
    val longitude: Double? = null,
    // Enriched in the use-case
    val infraction: Infraction? = null,
    // Enriched in the use-case
    val underCharter: Boolean? = null,
)
