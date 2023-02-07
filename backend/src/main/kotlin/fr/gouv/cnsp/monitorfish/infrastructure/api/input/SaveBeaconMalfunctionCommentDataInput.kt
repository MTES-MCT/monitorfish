package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionCommentUserType

data class SaveBeaconMalfunctionCommentDataInput(
    var comment: String,
    var userType: BeaconMalfunctionCommentUserType,
)
