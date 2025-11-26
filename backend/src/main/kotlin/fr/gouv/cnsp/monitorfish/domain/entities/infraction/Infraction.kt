package fr.gouv.cnsp.monitorfish.domain.entities.infraction

import fr.gouv.cnsp.monitorfish.domain.entities.infraction.InfractionCategory

data class Infraction(
    var natinfCode: Int,
    var regulation: String? = null,
    var infractionCategory: InfractionCategory? = null,
    var infraction: String? = null,
)
