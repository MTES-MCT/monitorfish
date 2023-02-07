package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.EndOfBeaconMalfunctionReason
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.VesselStatus

data class UpdateBeaconMalfunctionDataInput(
    var vesselStatus: VesselStatus? = null,
    var stage: Stage? = null,
    var endOfBeaconMalfunctionReason: EndOfBeaconMalfunctionReason? = null,
)
