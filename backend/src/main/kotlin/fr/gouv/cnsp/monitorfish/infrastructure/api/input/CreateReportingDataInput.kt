package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionThreat
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.OtherSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.SatelliteSource
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

class CreateReportingDataInput(
    val type: ReportingType,
    val vesselId: Int? = null,
    val vesselName: String? = null,
    val cfr: String? = null,
    val externalMarker: String? = null,
    val ircs: String? = null,
    val mmsi: String? = null,
    val imo: String? = null,
    val length: Double? = null,
    val gearCode: String? = null,
    val isFishing: Boolean? = null,
    val vesselIdentifier: VesselIdentifier? = null,
    val flagState: CountryCode,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val isIUU: Boolean = false,
    val creationDate: ZonedDateTime,
    val reportingDate: ZonedDateTime,
    val validationDate: ZonedDateTime? = null,
    val expirationDate: ZonedDateTime? = null,
    val reportingSource: ReportingSource,
    val controlUnitId: Int? = null,
    val authorContact: String? = null,
    val otherSourceType: OtherSource? = null,
    val satelliteType: SatelliteSource? = null,
    val title: String,
    val description: String? = null,
    val numberOfVessels: Int? = null,
    val threatHierarchies: List<ThreatHierarchyDataInput> = emptyList(),
) {
    fun toReporting(createdBy: String): Reporting {
        val infractions =
            threatHierarchies.map { threatHierarchy ->
                InfractionSuspicionThreat(
                    natinfCode =
                        threatHierarchy.children
                            .single()
                            .children
                            .single()
                            .value,
                    threat = threatHierarchy.value,
                    threatCharacterization = threatHierarchy.children.single().value,
                )
            }

        return if (type == ReportingType.INFRACTION_SUSPICION) {
            Reporting.InfractionSuspicion(
                vesselId = vesselId,
                vesselName = vesselName,
                cfr = cfr,
                externalMarker = externalMarker,
                ircs = ircs,
                mmsi = mmsi,
                imo = imo,
                length = length,
                gearCode = gearCode,
                isFishing = isFishing ?: false,
                vesselIdentifier = vesselIdentifier,
                flagState = flagState,
                creationDate = creationDate,
                reportingDate = reportingDate,
                lastUpdateDate = creationDate,
                validationDate = validationDate,
                expirationDate = expirationDate,
                isDeleted = false,
                isArchived = false,
                createdBy = createdBy,
                reportingSource = reportingSource,
                controlUnitId = controlUnitId,
                authorContact = authorContact,
                otherSourceType = otherSourceType,
                satelliteType = satelliteType,
                title = title,
                description = description,
                infractions = infractions,
                numberOfVessels = numberOfVessels,
                isIUU = isIUU,
                latitude = latitude,
                longitude = longitude,
            )
        } else {
            Reporting.Observation(
                vesselId = vesselId,
                vesselName = vesselName,
                cfr = cfr,
                externalMarker = externalMarker,
                ircs = ircs,
                mmsi = mmsi,
                imo = imo,
                length = length,
                gearCode = gearCode,
                isFishing = isFishing ?: false,
                vesselIdentifier = vesselIdentifier,
                flagState = flagState,
                creationDate = creationDate,
                reportingDate = reportingDate,
                lastUpdateDate = creationDate,
                validationDate = validationDate,
                expirationDate = expirationDate,
                isDeleted = false,
                isArchived = false,
                createdBy = createdBy,
                reportingSource = reportingSource,
                controlUnitId = controlUnitId,
                authorContact = authorContact,
                otherSourceType = otherSourceType,
                satelliteType = satelliteType,
                title = title,
                description = description,
                isIUU = isIUU,
                latitude = latitude,
                longitude = longitude,
            )
        }
    }
}
