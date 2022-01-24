package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusCommentUserType

data class SaveBeaconStatusCommentDataInput(
        var comment: String,
        var userType: BeaconStatusCommentUserType)
