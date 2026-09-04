package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier

data class VesselIdentity(
    val vesselId: Int?,
    val cfr: String?,
    val ircs: String?,
    val externalIdentification: String?,
    val name: String?,
    val flagState: CountryCode,
    val vesselIdentifier: VesselIdentifier?,
) {
    /**
     * Whether this identity and [other] designate the same vessel: by `vesselId` when both carry one, else
     * by the identifier field designated by `vesselIdentifier` (this one's, or [other]'s as a fallback).
     */
    fun isSameVesselAs(other: VesselIdentity): Boolean {
        if (this.vesselId != null && other.vesselId != null) {
            return this.vesselId == other.vesselId
        }

        return when (this.vesselIdentifier ?: other.vesselIdentifier) {
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> !this.cfr.isNullOrEmpty() && this.cfr == other.cfr
            VesselIdentifier.IRCS -> !this.ircs.isNullOrEmpty() && this.ircs == other.ircs
            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER ->
                !this.externalIdentification.isNullOrEmpty() &&
                    this.externalIdentification == other.externalIdentification
            null -> false
        }
    }

    fun isEqualToActiveVessel(activeVessel: EnrichedActiveVessel): Boolean {
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

        if (activeVessel.vessel == null) {
            return false
        }

        return when {
            this.vesselId != null -> this.vesselId == activeVessel.vessel.id

            !this.cfr.isNullOrEmpty() && !activeVessel.vessel.internalReferenceNumber.isNullOrEmpty() ->
                this.cfr == activeVessel.vessel.internalReferenceNumber

            !this.ircs.isNullOrEmpty() && !activeVessel.vessel.ircs.isNullOrEmpty() ->
                this.ircs == activeVessel.vessel.ircs

            !this.externalIdentification.isNullOrEmpty() &&
                !activeVessel.vessel.externalReferenceNumber.isNullOrEmpty() ->
                this.externalIdentification == activeVessel.vessel.externalReferenceNumber

            else -> false
        }
    }
}
