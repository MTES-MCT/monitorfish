package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripGear

data class LogbookTripGearDataInput(
    val code: String?,
    val dimensions: String?,
    val mesh: Double?,
    val name: String?,
) {
    fun toLogbookTripGear(): LogbookTripGear {
        return LogbookTripGear().apply {
            dimensions = dimensions
            gear = code
            gearName = name
            mesh = mesh
        }
    }
}
