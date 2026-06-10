package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

class SpeciesControlPrefill(
    var speciesCode: String,
    var faoZones: List<String>? = null,
    var presentationCodes: List<String>? = null,
    var rejectedWeight: Double? = null,
    var discardReason: DiscardReason? = null,
)
