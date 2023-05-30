package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.Infraction

interface InfractionRepository {
    fun findInfractionByNatinfCode(natinfCode: Int): Infraction
    fun findFishingAndSecurityInfractions(): List<Infraction>
}
