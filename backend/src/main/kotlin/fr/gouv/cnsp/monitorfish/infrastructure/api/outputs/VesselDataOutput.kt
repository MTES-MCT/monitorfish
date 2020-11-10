package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel

data class VesselDataOutput(
        val internalReferenceNumber: String ? = null,
        val externalReferenceNumber: String? = null,
        val vesselName: String? = null,
        val flagState: CountryCode? = null,
        val gearType: String? = null,
        val vesselType: String? = null,
        val positions: List<PositionDataOutput>) {
    companion object {
        fun fromVessel(vessel: Vessel, positions: List<Position>): VesselDataOutput {
            return VesselDataOutput(
                    internalReferenceNumber = vessel.internalReferenceNumber,
                    externalReferenceNumber = vessel.externalReferenceNumber,
                    vesselName = vessel.vesselName,
                    flagState = vessel.flagState,
                    gearType = vessel.gearType,
                    vesselType = vessel.vesselType,
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
