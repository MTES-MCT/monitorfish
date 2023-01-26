package fr.gouv.cnsp.monitorfish.domain.entities.mission_actions

data class GearInfraction(
    var infractionType: InfractionType? = null,
    var natinf: Int? = null,
    var comments: String? = null,
    var gearSeized: Boolean? = null
)
