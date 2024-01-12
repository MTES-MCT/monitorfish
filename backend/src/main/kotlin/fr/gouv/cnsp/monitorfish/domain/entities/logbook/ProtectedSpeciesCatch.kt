package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import com.fasterxml.jackson.annotation.JsonTypeName

@JsonTypeName("protectedSpeciesCatch")
class ProtectedSpeciesCatch {
    lateinit var species: String
    var speciesName: String? = null
    var sex: String? = null
    var healthState: HealthState? = null
    var careMinutes: Int? = null
    var ring: Int? = null
    var fate: Fate? = null
    var comment: String? = null
    var weight: Double? = null
    var nbFish: Double? = null
    var faoZone: String? = null
    var economicZone: String? = null
    var statisticalRectangle: String? = null
    var effortZone: String? = null
}

enum class HealthState {
    DEA,
    ALI,
    INJ
}

enum class Fate {
    DIS,
    HEC,
    DEA
}
