package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.dtos.ActiveVesselWithReferentialDataDTO

data class VesselIdentity(
    val vesselId: Int?,
    val cfr: String?,
    val ircs: String?,
    val externalIdentification: String?,
    val name: String?,
    val flagState: CountryCode,
    val vesselIdentifier: VesselIdentifier?,
) {
    fun isEqualToActiveVessel(activeVessel: ActiveVesselWithReferentialDataDTO): Boolean {
        if (activeVessel.lastPosition != null) {
            return when {
                this.vesselId != null && activeVessel.lastPosition.vesselId != null ->
                    this.vesselId == activeVessel.lastPosition.vesselId

                this.vesselIdentifier != null ->
                    when (this.vesselIdentifier) {
                        VesselIdentifier.INTERNAL_REFERENCE_NUMBER ->
                            this.vesselIdentifier == activeVessel.lastPosition.vesselIdentifier &&
                                this.cfr == activeVessel.lastPosition.internalReferenceNumber

                        VesselIdentifier.IRCS ->
                            this.vesselIdentifier == activeVessel.lastPosition.vesselIdentifier &&
                                this.ircs == activeVessel.lastPosition.ircs

                        VesselIdentifier.EXTERNAL_REFERENCE_NUMBER ->
                            this.vesselIdentifier == activeVessel.lastPosition.vesselIdentifier &&
                                this.externalIdentification == activeVessel.lastPosition.externalReferenceNumber
                    }

                !this.cfr.isNullOrEmpty() && !activeVessel.lastPosition.internalReferenceNumber.isNullOrEmpty() ->
                    this.cfr == activeVessel.lastPosition.internalReferenceNumber

                !this.ircs.isNullOrEmpty() && !activeVessel.lastPosition.ircs.isNullOrEmpty() ->
                    this.ircs == activeVessel.lastPosition.ircs

                !this.externalIdentification.isNullOrEmpty() &&
                    !activeVessel.lastPosition.externalReferenceNumber.isNullOrEmpty() ->
                    this.externalIdentification == activeVessel.lastPosition.externalReferenceNumber

                else -> false
            }
        }

        requireNotNull(activeVessel.vessel)

        return when {
            this.vesselId != null -> this.vesselId == activeVessel.vessel.id

            !this.cfr.isNullOrEmpty() && !activeVessel.vessel.internalReferenceNumber.isNullOrEmpty() ->
                this.cfr == activeVessel.vessel.internalReferenceNumber

            !this.ircs.isNullOrEmpty() && !activeVessel.vessel.ircs.isNullOrEmpty() ->
                this.ircs == activeVessel.vessel.ircs

            !this.externalIdentification.isNullOrEmpty() && !activeVessel.vessel.externalReferenceNumber.isNullOrEmpty() ->
                this.externalIdentification == activeVessel.vessel.externalReferenceNumber

            else -> false
        }
    }
}
