package fr.gouv.cnsp.monitorfish.domain.entities.last_position

/**
 * A data class (compared by value), so that the active vessels changes are detected (see `ActiveVesselsChangeTracker`).
 */
data class Gear(
    var gear: String? = null,
    var mesh: Double? = null,
    var dimensions: String? = null,
)
