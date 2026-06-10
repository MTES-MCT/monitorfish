package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

class DiscardedSpeciesControl(
    var speciesCode: String,
    var rejectedWeight: Double? = null,
    var discardReason: DiscardReason? = null,
    var faoZones: List<String>? = null,
)
