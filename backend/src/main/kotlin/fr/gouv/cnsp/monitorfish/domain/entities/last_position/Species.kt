package fr.gouv.cnsp.monitorfish.domain.entities.last_position

data class Species(
    var weight: Double? = null,
    var species: String? = null,
    var faoZone: String? = null,
    var gear: String? = null,
)
