package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity

data class VesselIdentityDataInput(
    val vesselId: Int?,
    val cfr: String?,
    val ircs: String?,
    val externalIdentification: String?,
    val name: String?,
    val flagState: CountryCode,
    val vesselIdentifier: VesselIdentifier?,
) {
    fun toVesselIdentity(): VesselIdentity =
        VesselIdentity(
            vesselId = vesselId,
            cfr = cfr,
            ircs = ircs,
            externalIdentification = externalIdentification,
            name = name,
            flagState = flagState,
            vesselIdentifier = vesselIdentifier,
        )
}
