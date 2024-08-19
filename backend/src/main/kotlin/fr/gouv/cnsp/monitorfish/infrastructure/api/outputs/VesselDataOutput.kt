package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Beacon
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import java.util.*

data class VesselDataOutput(
    val vesselId: Int? = null,
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
    val declaredFishingGears: List<String>? = null,
    val pinger: Boolean? = null,
    val navigationLicenceExpirationDate: Date? = null,
    val operatorName: String? = null,
    val operatorPhones: List<String>? = null,
    val operatorEmail: String? = null,
    val proprietorName: String? = null,
    val proprietorPhones: List<String>? = null,
    val proprietorEmails: List<String>? = null,
    val vesselPhones: List<String>? = null,
    val vesselEmails: List<String>? = null,
    val riskFactor: RiskFactorDataOutput? = null,
    val beacon: BeaconDataOutput? = null,
    val underCharter: Boolean? = null,
    val logbookEquipmentStatus: String? = null,
    val logbookSoftware: String? = null,
    val hasLogbookEsacapt: Boolean,
    val hasVisioCaptures: Boolean? = null,
) {
    companion object {
        fun fromVesselAndRelatedDatas(vessel: Vessel?, beacon: Beacon?, vesselRiskFactor: VesselRiskFactor): VesselDataOutput? {
            if (vessel == null) {
                return null
            }

            return VesselDataOutput(
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
                beacon = beacon?.let { BeaconDataOutput.fromBeacon(it) },
                riskFactor = RiskFactorDataOutput.fromVesselRiskFactor(vesselRiskFactor),
                underCharter = vessel.underCharter,
                logbookEquipmentStatus = vessel.logbookEquipmentStatus,
                logbookSoftware = vessel.logbookSoftware,
                hasLogbookEsacapt = vessel.hasLogbookEsacapt,
                hasVisioCaptures = vessel.hasVisioCaptures,
            )
        }

        fun fromVessel(vessel: Vessel): VesselDataOutput {
            return VesselDataOutput(
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
            )
        }
    }
}
