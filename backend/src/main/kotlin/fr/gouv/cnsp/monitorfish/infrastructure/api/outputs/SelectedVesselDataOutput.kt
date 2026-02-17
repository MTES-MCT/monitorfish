package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.fasterxml.jackson.annotation.JsonInclude
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActivityOrigin
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import java.time.Duration
import java.time.ZonedDateTime
import java.util.*

/**
 * We remove null fields from the payload to reduce JSON size.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
data class SelectedVesselDataOutput(
    val vesselId: Int? = null,
    val activityOrigin: ActivityOrigin? = null,
    val beaconMalfunctionId: Int? = null,
    val internalReferenceNumber: String? = null,
    val IMO: String? = null,
    val mmsi: String? = null,
    val ircs: String? = null,
    val externalReferenceNumber: String? = null,
    val vesselName: String? = null,
    val flagState: CountryCode,
    val width: Double? = null,
    val length: Double? = null,
    val district: String? = null,
    val districtCode: String? = null,
    val gauge: Double? = null,
    val registryPort: String? = null,
    val power: Double? = null,
    val vesselType: String? = null,
    val sailingCategory: String? = null,
    val sailingType: String? = null,
    val declaredFishingGears: List<String>,
    val pinger: Boolean? = null,
    val navigationLicenceExpirationDate: Date? = null,
    val navigationLicenceExtensionDate: Date? = null,
    val navigationLicenceStatus: String? = null,
    val bossName: String? = null,
    val bossAddress: String? = null,
    val operatorName: String? = null,
    val operatorPhones: List<String> = listOf(),
    val operatorEmail: String? = null,
    val proprietorName: String? = null,
    val proprietorPhones: List<String> = listOf(),
    val proprietorEmails: List<String> = listOf(),
    val lastPositionLatitude: Double? = null,
    val lastPositionLongitude: Double? = null,
    val lastPositionSpeed: Double? = null,
    val lastPositionCourse: Double? = null,
    val lastPositionDateTime: ZonedDateTime? = null,
    val emissionPeriod: Duration? = null,
    val alerts: List<String> = listOf(),
    val reportings: List<ReportingType> = listOf(),
    val vesselIdentifier: VesselIdentifier? = null,
    val hasInfractionSuspicion: Boolean = false,
    val hasAlert: Boolean = false,
    val segments: List<String> = listOf(),
    val vesselPhones: List<String> = listOf(),
    val vesselEmails: List<String> = listOf(),
    val riskFactor: RiskFactorDataOutput,
    val beacon: BeaconDataOutput? = null,
    val underCharter: Boolean? = null,
    val logbookEquipmentStatus: String? = null,
    val logbookSoftware: String? = null,
    val hasLogbookEsacapt: Boolean,
    val hasVisioCaptures: Boolean? = null,
    val producerOrganization: ProducerOrganizationMembershipDataOutput? = null,
    val profile: VesselProfileDataOutput? = null,
    // Could be either `DynamicVesselGroupDataOutput` or `FixedVesselGroupDataOutput`
    val groups: List<Any> = listOf(),
) {
    companion object {
        fun fromEnrichedActiveVessel(enrichedActiveVessel: EnrichedActiveVessel) =
            SelectedVesselDataOutput(
                activityOrigin = enrichedActiveVessel.activityOrigin,
                vesselId = enrichedActiveVessel.vessel?.id,
                beaconMalfunctionId = enrichedActiveVessel.lastPosition?.beaconMalfunctionId,
                internalReferenceNumber =
                    enrichedActiveVessel.vessel?.internalReferenceNumber
                        ?: enrichedActiveVessel.lastPosition?.internalReferenceNumber,
                IMO = enrichedActiveVessel.vessel?.imo,
                ircs = enrichedActiveVessel.vessel?.ircs ?: enrichedActiveVessel.lastPosition?.ircs,
                mmsi = enrichedActiveVessel.vessel?.mmsi ?: enrichedActiveVessel.lastPosition?.mmsi,
                externalReferenceNumber =
                    enrichedActiveVessel.vessel?.externalReferenceNumber
                        ?: enrichedActiveVessel.lastPosition?.externalReferenceNumber,
                vesselName = enrichedActiveVessel.vessel?.vesselName ?: enrichedActiveVessel.lastPosition?.vesselName,
                flagState =
                    enrichedActiveVessel.vessel?.flagState
                        ?: enrichedActiveVessel.lastPosition?.flagState
                        ?: CountryCode.UNDEFINED,
                width = enrichedActiveVessel.vessel?.width,
                length = enrichedActiveVessel.vessel?.length,
                district = enrichedActiveVessel.vessel?.district,
                districtCode = enrichedActiveVessel.vessel?.districtCode,
                gauge = enrichedActiveVessel.vessel?.gauge,
                registryPort = enrichedActiveVessel.vessel?.registryPort,
                power = enrichedActiveVessel.vessel?.power,
                vesselType = enrichedActiveVessel.vessel?.vesselType,
                sailingCategory = enrichedActiveVessel.vessel?.sailingCategory,
                sailingType = enrichedActiveVessel.vessel?.sailingType,
                declaredFishingGears = enrichedActiveVessel.vessel?.declaredFishingGears ?: listOf(),
                pinger = enrichedActiveVessel.vessel?.pinger,
                navigationLicenceExpirationDate = enrichedActiveVessel.vessel?.navigationLicenceExpirationDate,
                navigationLicenceExtensionDate = enrichedActiveVessel.vessel?.navigationLicenceExtensionDate,
                navigationLicenceStatus = enrichedActiveVessel.vessel?.navigationLicenceStatus,
                bossName = enrichedActiveVessel.vessel?.bossName,
                bossAddress = enrichedActiveVessel.vessel?.bossAddress,
                operatorName = enrichedActiveVessel.vessel?.operatorName,
                operatorPhones = enrichedActiveVessel.vessel?.operatorPhones ?: listOf(),
                operatorEmail = enrichedActiveVessel.vessel?.operatorEmail,
                proprietorName = enrichedActiveVessel.vessel?.proprietorName,
                proprietorPhones = enrichedActiveVessel.vessel?.proprietorPhones ?: listOf(),
                proprietorEmails = enrichedActiveVessel.vessel?.proprietorEmails ?: listOf(),
                vesselPhones = enrichedActiveVessel.vessel?.vesselPhones ?: listOf(),
                vesselEmails = enrichedActiveVessel.vessel?.vesselEmails ?: listOf(),
                beacon = enrichedActiveVessel.beacon?.let { BeaconDataOutput.fromBeacon(it) },
                riskFactor =
                    RiskFactorDataOutput.fromVesselRiskFactor(
                        vesselRiskFactor = enrichedActiveVessel.riskFactor,
                        isRecentProfile = enrichedActiveVessel.activityOrigin == ActivityOrigin.FROM_RECENT_PROFILE,
                    ),
                underCharter = enrichedActiveVessel.vessel?.underCharter,
                logbookEquipmentStatus = enrichedActiveVessel.vessel?.logbookEquipmentStatus,
                logbookSoftware = enrichedActiveVessel.vessel?.logbookSoftware,
                hasLogbookEsacapt = enrichedActiveVessel.vessel?.hasLogbookEsacapt ?: false,
                hasVisioCaptures = enrichedActiveVessel.vessel?.hasVisioCaptures,
                producerOrganization =
                    enrichedActiveVessel.producerOrganization?.let {
                        ProducerOrganizationMembershipDataOutput.fromProducerOrganizationMembership(it)
                    },
                lastPositionLatitude = enrichedActiveVessel.lastPosition?.latitude,
                lastPositionLongitude = enrichedActiveVessel.lastPosition?.longitude,
                lastPositionSpeed = enrichedActiveVessel.lastPosition?.speed,
                lastPositionCourse = enrichedActiveVessel.lastPosition?.course,
                lastPositionDateTime = enrichedActiveVessel.lastPosition?.dateTime,
                emissionPeriod = enrichedActiveVessel.lastPosition?.emissionPeriod,
                alerts = enrichedActiveVessel.lastPosition?.alerts ?: listOf(),
                reportings = enrichedActiveVessel.reportingTypes,
                hasAlert = enrichedActiveVessel.lastPosition?.alerts?.isNotEmpty() ?: false,
                hasInfractionSuspicion = enrichedActiveVessel.hasInfractionSuspicion,
                vesselIdentifier = enrichedActiveVessel.lastPosition?.vesselIdentifier,
                segments = enrichedActiveVessel.lastPosition?.segments ?: listOf(),
                groups =
                    enrichedActiveVessel.vesselGroups.map {
                        when (it) {
                            is DynamicVesselGroup -> DynamicVesselGroupDataOutput.fromDynamicVesselGroup(it)
                            is FixedVesselGroup ->
                                FixedVesselGroupDataOutput.fromFixedVesselGroup(
                                    vesselGroup = it,
                                )
                        }
                    },
                profile = enrichedActiveVessel.vesselProfile?.let { VesselProfileDataOutput.fromVesselProfile(it) },
            )

        fun fromVessel(vessel: Vessel): SelectedVesselDataOutput =
            SelectedVesselDataOutput(
                activityOrigin = null,
                vesselId = vessel.id,
                internalReferenceNumber = vessel.internalReferenceNumber,
                IMO = vessel.imo,
                ircs = vessel.ircs,
                mmsi = vessel.mmsi,
                externalReferenceNumber = vessel.externalReferenceNumber,
                vesselName = vessel.vesselName,
                flagState = vessel.flagState,
                width = vessel.width,
                length = vessel.length,
                district = vessel.district,
                districtCode = vessel.districtCode,
                gauge = vessel.gauge,
                registryPort = vessel.registryPort,
                power = vessel.power,
                vesselType = vessel.vesselType,
                sailingCategory = vessel.sailingCategory,
                sailingType = vessel.sailingType,
                declaredFishingGears = vessel.declaredFishingGears,
                pinger = vessel.pinger,
                navigationLicenceExpirationDate = vessel.navigationLicenceExpirationDate,
                operatorName = vessel.operatorName,
                operatorPhones = vessel.operatorPhones,
                operatorEmail = vessel.operatorEmail,
                proprietorName = vessel.proprietorName,
                proprietorPhones = vessel.proprietorPhones,
                proprietorEmails = vessel.proprietorEmails,
                vesselPhones = vessel.vesselPhones,
                vesselEmails = vessel.vesselEmails,
                underCharter = vessel.underCharter,
                logbookEquipmentStatus = vessel.logbookEquipmentStatus,
                hasLogbookEsacapt = vessel.hasLogbookEsacapt,
                hasVisioCaptures = vessel.hasVisioCaptures,
                reportings = emptyList(),
                // TODO Unused in the frontend - to remove ?
                riskFactor = RiskFactorDataOutput.fromVesselRiskFactor(VesselRiskFactor()),
            )
    }
}
