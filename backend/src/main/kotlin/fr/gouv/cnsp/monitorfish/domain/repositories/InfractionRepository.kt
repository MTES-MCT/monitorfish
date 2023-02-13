package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.Infraction

interface InfractionRepository {
    fun findInfractionByNatinfCode(natinfCode: String): Infraction
    fun findFishingInfractions(): List<Infraction>
}
