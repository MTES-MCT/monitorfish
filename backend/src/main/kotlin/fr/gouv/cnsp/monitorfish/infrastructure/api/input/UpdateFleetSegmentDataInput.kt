package fr.gouv.cnsp.monitorfish.infrastructure.api.input

data class UpdateFleetSegmentDataInput(
        var segment: String? = null,
        var segmentName: String? = null,
        var gears: List<String>? = null,
        var faoAreas: List<String>? = null,
        var targetSpecies: List<String>? = null,
        var bycatchSpecies: List<String>? = null,
        var impactRiskFactor: Double? = null
)