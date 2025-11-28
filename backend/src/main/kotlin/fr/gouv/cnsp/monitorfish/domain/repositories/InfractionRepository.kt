package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction

interface InfractionRepository {
    fun findInfractionByNatinfCode(natinfCode: Int): Infraction

    fun findAll(): List<Infraction>
}
