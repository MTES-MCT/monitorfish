package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

data class LogbookInfraction(
    var infractionType: InfractionType? = null,
    var natinf: Int? = null,
    var comments: String? = null,
)
