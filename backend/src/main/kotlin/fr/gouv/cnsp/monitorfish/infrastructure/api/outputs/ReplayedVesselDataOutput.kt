package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.fasterxml.jackson.annotation.JsonInclude
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.coordinates.transformCoordinatesToOpenlayersProjection
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ReplayedVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ReplayedVesselDataOutput(
    val vesselId: Int?,
    val vesselFeatureId: String,
    val vesselIdentifier: VesselIdentifier,
    val internalReferenceNumber: String?,
    val ircs: String?,
    val externalReferenceNumber: String?,
    val mmsi: String?,
    val vesselName: String?,
    val flagState: CountryCode?,
    val length: Double?,
    val district: String?,
    val districtCode: String?,
    val underCharter: Boolean?,
    val producerOrganization: String?,
    val latitude: Double,
    val longitude: Double,
    val speed: Double?,
    val course: Double?,
    val dateTime: ZonedDateTime,
    val positionType: PositionType,
    val isAtPort: Boolean?,
    // Properties for WebGL
    val coordinates: List<Double>?,
) {
    companion object {
        fun fromReplayedVessel(replayedVessel: ReplayedVessel): ReplayedVesselDataOutput {
            val position = replayedVessel.position
            val vessel = replayedVessel.vessel

            return ReplayedVesselDataOutput(
                vesselId = vessel?.id,
                vesselFeatureId =
                    Vessel.getVesselCompositeIdentifier(
                        internalReferenceNumber = position.internalReferenceNumber,
                        ircs = position.ircs,
                        externalReferenceNumber = position.externalReferenceNumber,
                    ),
                vesselIdentifier =
                    when {
                        position.internalReferenceNumber != null -> VesselIdentifier.INTERNAL_REFERENCE_NUMBER
                        position.ircs != null -> VesselIdentifier.IRCS
                        else -> VesselIdentifier.EXTERNAL_REFERENCE_NUMBER
                    },
                internalReferenceNumber = position.internalReferenceNumber,
                ircs = position.ircs,
                externalReferenceNumber = position.externalReferenceNumber,
                mmsi = position.mmsi ?: vessel?.mmsi,
                vesselName = vessel?.vesselName ?: position.vesselName,
                flagState = vessel?.flagState ?: position.flagState,
                length = vessel?.length,
                district = vessel?.district,
                districtCode = vessel?.districtCode,
                underCharter = vessel?.underCharter,
                producerOrganization = replayedVessel.producerOrganization?.organizationName,
                latitude = position.latitude,
                longitude = position.longitude,
                speed = position.speed,
                course = position.course,
                dateTime = position.dateTime,
                positionType = position.positionType,
                isAtPort = position.isAtPort,
                coordinates =
                    transformCoordinatesToOpenlayersProjection(
                        longitude = position.longitude,
                        latitude = position.latitude,
                    )?.toList(),
            )
        }
    }
}
