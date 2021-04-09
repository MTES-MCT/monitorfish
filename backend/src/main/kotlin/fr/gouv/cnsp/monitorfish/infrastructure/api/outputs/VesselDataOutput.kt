package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
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
        val positions: List<PositionDataOutput>) {
    companion object {
        fun fromVessel(vessel: Vessel, positions: List<Position>): VesselDataOutput {
            return VesselDataOutput(
                    id = vessel.id,
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
                    operatorEmails = vessel.operatorEmails,
                    proprietorName = vessel.proprietorName,
                    proprietorPhones = vessel.proprietorPhones,
                    proprietorEmails = vessel.proprietorEmails,
                    vesselPhones = vessel.vesselPhones,
                    vesselEmails = vessel.vesselEmails,
                    positions = positions.map {
                        PositionDataOutput(
                                internalReferenceNumber = it.internalReferenceNumber,
                                ircs = it.ircs,
                                mmsi = it.mmsi,
                                externalReferenceNumber = it.externalReferenceNumber,
                                dateTime = it.dateTime,
                                latitude = it.latitude,
                                longitude = it.longitude,
                                vesselName = it.vesselName,
                                speed = it.speed,
                                course = it.course,
                                flagState = it.flagState,
                                destination = it.destination,
                                from = it.from,
                                tripNumber = it.tripNumber,
                                positionType = it.positionType
                        )
                    }
            )
        }
    }
}
