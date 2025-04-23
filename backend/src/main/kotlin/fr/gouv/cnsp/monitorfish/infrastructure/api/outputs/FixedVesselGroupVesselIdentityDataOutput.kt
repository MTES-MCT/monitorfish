package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity

data class FixedVesselGroupVesselIdentityDataOutput (
    val vesselId: Int?,
    val cfr: String?,
    val ircs: String?,
    val externalIdentification: String?,
    val name: String?,
    val flagState: CountryCode,
    val vesselIdentifier: VesselIdentifier?,
){
    companion object {
        fun fromVesselIdentity(vessel: VesselIdentity) =
            FixedVesselGroupVesselIdentityDataOutput(
                vesselId = vessel.vesselId,
                cfr = vessel.cfr,
                ircs = vessel.ircs,
                externalIdentification = vessel.externalIdentification,
                name = vessel.name,
                flagState = vessel.flagState,
                vesselIdentifier = vessel.vesselIdentifier,
            )
    }
}
