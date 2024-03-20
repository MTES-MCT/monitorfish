package fr.gouv.cnsp.monitorfish.domain.entities.logbook

data class LogbookTripGear(
    /** Gear code. */
    val gear: String,
    val mesh: Int,
    val dimensions: String,
)
