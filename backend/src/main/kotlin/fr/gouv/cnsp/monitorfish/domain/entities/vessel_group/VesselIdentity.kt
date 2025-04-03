package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier

data class VesselIdentity(
    val vesselId: Int?,
    val cfr: String?,
    val ircs: String?,
    val externalIdentification: String?,
    val name: String?,
    val flagState: CountryCode,
    val vesselIdentifier: VesselIdentifier?,
)
