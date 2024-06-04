package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

data class PnoTypeRule(
    val id: Int,
    val species: List<String>,
    val faoAreas: List<String>,
    val cgpmAreas: List<String>,
    val gears: List<String>,
    val flagStates: List<String>,
    val minimumQuantityKg: Double,
)
