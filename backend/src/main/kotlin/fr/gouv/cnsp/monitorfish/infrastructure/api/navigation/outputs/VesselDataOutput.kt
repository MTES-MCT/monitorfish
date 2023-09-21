package fr.gouv.cnsp.monitorfish.infrastructure.api.navigation.outputs

import com.neovisionaries.i18n.CountryCode
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
    val beaconNumber: String? = null,
    val underCharter: Boolean? = null,
) {
    companion object {
        fun fromVessel(vessel: Vessel?): VesselDataOutput? {
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
                beaconNumber = vessel.beaconNumber,
                underCharter = vessel.underCharter,
            )
        }
    }
}
