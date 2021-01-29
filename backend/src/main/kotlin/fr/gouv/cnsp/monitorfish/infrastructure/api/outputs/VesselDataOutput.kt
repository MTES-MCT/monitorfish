package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import java.util.*

data class VesselDataOutput(
        val internalReferenceNumber: String? = null,
        val IMO: String? = null,
        val MMSI: String? = null,
        val IRCS: String? = null,
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
        val weightAuthorizedOnDeck: Double? = null,
        val pinger: Boolean? = null,
        val navigationLicenceExpirationDate: Date? = null,
        val shipownerName: String? = null,
        val shipownerPhones: List<String>? = null,
        val shipownerEmails: List<String>? = null,
        val fisherName: String? = null,
        val fisherPhones: List<String>? = null,
        val fisherEmails: List<String>? = null,
        val positions: List<PositionDataOutput>) {
    companion object {
        fun fromVessel(vessel: Vessel, positions: List<Position>): VesselDataOutput {
            return VesselDataOutput(
                    internalReferenceNumber = vessel.internalReferenceNumber,
                    IMO = vessel.IMO,
                    IRCS = vessel.IRCS,
                    MMSI = vessel.MMSI,
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
                    weightAuthorizedOnDeck = vessel.weightAuthorizedOnDeck,
                    pinger = vessel.pinger,
                    navigationLicenceExpirationDate = vessel.navigationLicenceExpirationDate,
                    shipownerName = vessel.shipownerName,
                    shipownerPhones = vessel.shipownerPhones,
                    shipownerEmails = vessel.shipownerEmails,
                    fisherName = vessel.fisherName,
                    fisherPhones = vessel.fisherPhones,
                    fisherEmails = vessel.fisherEmails,
                    positions = positions.map {
                        PositionDataOutput(
                                internalReferenceNumber = it.internalReferenceNumber,
                                IRCS = it.IRCS,
                                MMSI = it.MMSI,
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
