package fr.gouv.cnsp.monitorfish.domain.entities.infraction

data class Infraction(
    var natinfCode: Int,
    var regulation: String? = null,
    var infractionCategory: InfractionCategory? = null,
    var infraction: String? = null,
)
