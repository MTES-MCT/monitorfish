package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction

data class InfractionDataOutput(
    var natinfCode: Int? = null,
    var regulation: String? = null,
    var infractionCategory: String? = null,
    var infraction: String? = null,
) {
    companion object {
        fun fromInfraction(infraction: Infraction) = InfractionDataOutput(
            natinfCode = infraction.natinfCode,
            regulation = infraction.regulation,
            infractionCategory = infraction.infractionCategory.toString(),
            infraction = infraction.infraction,
        )
    }
}
