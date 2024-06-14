package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import com.fasterxml.jackson.annotation.JsonTypeName

@JsonTypeName("catch")
data class LogbookFishingCatch(
    var weight: Double? = null,
    var nbFish: Double? = null,
    /** Species FAO code. */
    var species: String? = null,
    var speciesName: String? = null,
    var faoZone: String? = null,
    var freshness: String? = null,
    var packaging: String? = null,
    var effortZone: String? = null,
    var presentation: String? = null,
    var economicZone: String? = null,
    var conversionFactor: Double? = null,
    var preservationState: String? = null,
    var statisticalRectangle: String? = null,
)
