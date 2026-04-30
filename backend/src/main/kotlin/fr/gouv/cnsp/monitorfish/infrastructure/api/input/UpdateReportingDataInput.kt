package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionThreat
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.OtherSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingValidityOption
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.SatelliteSource
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.dtos.ReportingUpdateCommand
import java.time.ZonedDateTime

class UpdateReportingDataInput(
    val reportingSource: ReportingSource,
    val vesselId: Int? = null,
    val vesselName: String? = null,
    val cfr: String? = null,
    val externalMarker: String? = null,
    val ircs: String? = null,
    val mmsi: String? = null,
    val imo: String? = null,
    val vesselIdentifier: VesselIdentifier? = null,
    val flagState: CountryCode,
    val length: Double? = null,
    val gearCode: String? = null,
    val isFishing: Boolean? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
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
    val threatHierarchies: List<ThreatHierarchyDataInput> = emptyList(),
) {
    fun toUpdatedReportingValues(): ReportingUpdateCommand {
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

        return ReportingUpdateCommand(
            vesselId = this.vesselId,
            vesselName = this.vesselName,
            cfr = this.cfr,
            externalMarker = this.externalMarker,
            ircs = this.ircs,
            mmsi = this.mmsi,
            length = this.length,
            reportingSource = this.reportingSource,
            type = this.type,
            controlUnitId = this.controlUnitId,
            authorContact = this.authorContact,
            otherSourceType = this.otherSourceType,
            satelliteType = this.satelliteType,
            expirationDate = this.expirationDate,
            validityOption = this.validityOption,
            reportingDate = this.reportingDate,
            title = this.title,
            description = this.description,
            infractions = infractions,
            gearCode = this.gearCode,
            vesselIdentifier = this.vesselIdentifier,
            flagState = this.flagState,
            isFishing = this.isFishing,
            numberOfVessels = this.numberOfVessels,
            latitude = this.latitude,
            longitude = this.longitude,
        )
    }
}
