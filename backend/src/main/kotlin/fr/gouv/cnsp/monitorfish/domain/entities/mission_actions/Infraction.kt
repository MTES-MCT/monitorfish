package fr.gouv.cnsp.monitorfish.domain.entities.mission_actions

data class Infraction(
    var id: Int,
    var natinfCode: String? = null,
    var regulation: String? = null,
    var infractionCategory: InfractionCategory? = null,
    var infraction: String? = null
)
