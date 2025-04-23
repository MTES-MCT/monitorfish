package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

data class VesselIdentity(
    val vesselId: Int?,
    val cfr: String?,
    val ircs: String?,
    val externalIdentification: String?,
    val name: String?,
    val flagState: CountryCode,
    val vesselIdentifier: VesselIdentifier?,
) {
    fun isEqualToLastPosition(
        lastPosition: LastPosition,
    ): Boolean {
        return when {
            this.vesselId != null && lastPosition.vesselId != null ->
                this.vesselId == lastPosition.vesselId

            this.vesselIdentifier != null -> when (this.vesselIdentifier) {
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER ->
                    this.vesselIdentifier == lastPosition.vesselIdentifier &&
                        this.cfr == lastPosition.internalReferenceNumber

                VesselIdentifier.IRCS ->
                    this.vesselIdentifier == lastPosition.vesselIdentifier &&
                        this.ircs == lastPosition.ircs

                VesselIdentifier.EXTERNAL_REFERENCE_NUMBER ->
                    this.vesselIdentifier == lastPosition.vesselIdentifier &&
                        this.externalIdentification == lastPosition.externalReferenceNumber
            }

            !this.cfr.isNullOrEmpty() && !lastPosition.internalReferenceNumber.isNullOrEmpty() ->
                this.cfr == lastPosition.internalReferenceNumber

            !this.ircs.isNullOrEmpty() && !lastPosition.ircs.isNullOrEmpty() ->
                this.ircs == lastPosition.ircs

            !this.externalIdentification.isNullOrEmpty() && !lastPosition.externalReferenceNumber.isNullOrEmpty() ->
                this.externalIdentification == lastPosition.externalReferenceNumber

            else -> false
        }
    }

    fun toLastPosition(index: Int) = LastPosition(
        id = index,
        vesselId = this.vesselId,
        internalReferenceNumber = this.cfr,
        mmsi = null,
        ircs = this.cfr,
        externalReferenceNumber = this.externalIdentification,
        vesselName = this.name,
        flagState = this.flagState,
        // TODO Remove this dummy position type
        positionType = PositionType.VMS,
        latitude = 0.0,
        longitude = 0.0,
        // TODO Remove this dummy vessel identifier
        vesselIdentifier = this.vesselIdentifier ?: VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
        underCharter = null,
        isAtPort = false,
        alerts = null,
        beaconMalfunctionId = null,
        // TODO Remove this dummy date time
        dateTime = ZonedDateTime.now().minusYears(20),
    )
}
