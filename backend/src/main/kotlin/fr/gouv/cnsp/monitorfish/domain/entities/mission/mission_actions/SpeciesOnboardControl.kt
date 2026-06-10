package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

class SpeciesOnboardControl {
    var speciesCode: String? = null
    var speciesName: String? = null
    var isNotLanded: Boolean? = null
    var nbFish: Double? = null
    var declaredWeight: Double? = null
    var controlledWeight: Double? = null
    var underSized: Boolean? = null
    var underSizedWeight: Double? = null
    var presentationCodes: List<String>? = null
    var faoZones: List<String>? = null
}
