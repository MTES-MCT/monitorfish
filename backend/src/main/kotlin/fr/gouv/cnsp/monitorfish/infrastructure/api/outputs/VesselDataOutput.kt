package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.VesselWithData
import java.util.*

data class VesselDataOutput(
        val id: Int? = null,
        val internalReferenceNumber: String? = null,
        val IMO: String? = null,
        val mmsi: String? = null,
        val ircs: String? = null,
        val externalReferenceNumber: String? = null,
        val vesselName: String? = null,
        val flagState: CountryCode? = null,
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
        val operatorEmails: List<String>? = null,
        val proprietorName: String? = null,
        val proprietorPhones: List<String>? = null,
        val proprietorEmails: List<String>? = null,
        val vesselPhones: List<String>? = null,
        val vesselEmails: List<String>? = null,
        val beaconNumber: String? = null,
        val positions: List<PositionDataOutput>,
        val riskFactor: RiskFactorDataOutput? = null,
        val underCharter: Boolean? = null) {
    companion object {
        fun fromVesselWithData(vesselWithData: VesselWithData): VesselDataOutput {
            return VesselDataOutput(
                    id = vesselWithData.vessel.id,
                    internalReferenceNumber = vesselWithData.vessel.internalReferenceNumber,
                    IMO = vesselWithData.vessel.imo,
                    ircs = vesselWithData.vessel.ircs,
                    mmsi = vesselWithData.vessel.mmsi,
                    externalReferenceNumber = vesselWithData.vessel.externalReferenceNumber,
                    vesselName = vesselWithData.vessel.vesselName,
                    flagState = vesselWithData.vessel.flagState,
                    width = vesselWithData.vessel.width,
                    length = vesselWithData.vessel.length,
                    district = vesselWithData.vessel.district,
                    districtCode = vesselWithData.vessel.districtCode,
                    gauge = vesselWithData.vessel.gauge,
                    registryPort = vesselWithData.vessel.registryPort,
                    power = vesselWithData.vessel.power,
                    vesselType = vesselWithData.vessel.vesselType,
                    sailingCategory = vesselWithData.vessel.sailingCategory,
                    sailingType = vesselWithData.vessel.sailingType,
                    declaredFishingGears = vesselWithData.vessel.declaredFishingGears,
                    pinger = vesselWithData.vessel.pinger,
                    navigationLicenceExpirationDate = vesselWithData.vessel.navigationLicenceExpirationDate,
                    operatorName = vesselWithData.vessel.operatorName,
                    operatorPhones = vesselWithData.vessel.operatorPhones,
                    operatorEmails = vesselWithData.vessel.operatorEmails,
                    proprietorName = vesselWithData.vessel.proprietorName,
                    proprietorPhones = vesselWithData.vessel.proprietorPhones,
                    proprietorEmails = vesselWithData.vessel.proprietorEmails,
                    vesselPhones = vesselWithData.vessel.vesselPhones,
                    vesselEmails = vesselWithData.vessel.vesselEmails,
                    beaconNumber = vesselWithData.vessel.beaconNumber,
                    positions = vesselWithData.positions.map {
                        PositionDataOutput.fromPosition(it)
                    },
                    riskFactor = RiskFactorDataOutput.fromVesselRiskFactor(vesselWithData.vesselRiskFactor),
                    underCharter = vesselWithData.vessel.underCharter
            )
        }
    }
}
