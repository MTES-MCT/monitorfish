package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.dtos

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionThreat
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.OtherSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingValidityOption
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.SatelliteSource
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

class ReportingUpdateCommand(
    val vesselId: Int? = null,
    val vesselName: String? = null,
    val cfr: String? = null,
    val externalMarker: String? = null,
    val ircs: String? = null,
    val mmsi: String? = null,
    val imo: String? = null,
    val length: Double? = null,
    val gearCode: String? = null,
    val vesselIdentifier: VesselIdentifier? = null,
    val flagState: CountryCode,
    val isFishing: Boolean? = null,
    val latitude: Double?,
    val longitude: Double?,
    val reportingSource: ReportingSource,
    val type: ReportingType,
    val controlUnitId: Int? = null,
    val authorContact: String? = null,
    val otherSourceType: OtherSource? = null,
    val satelliteType: SatelliteSource? = null,
    val expirationDate: ZonedDateTime? = null,
    val validityOption: ReportingValidityOption? = null,
    val reportingDate: ZonedDateTime,
    val title: String,
    val description: String? = null,
    val numberOfVessels: Int? = null,
    val infractions: List<InfractionSuspicionThreat> = emptyList(),
)
