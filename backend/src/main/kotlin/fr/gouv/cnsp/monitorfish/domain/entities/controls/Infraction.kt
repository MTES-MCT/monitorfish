package fr.gouv.cnsp.monitorfish.domain.entities.controls

data class Infraction(
    var id: Int,
    var natinfCode: String? = null,
    var regulation: String? = null,
    var infractionCategory: String? = null,
    var infraction: String? = null
)
