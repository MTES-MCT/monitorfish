package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselStatus

data class UpdateBeaconStatusDataInput(
        var vesselStatus: VesselStatus? = null,
        var stage: Stage? = null,
)
