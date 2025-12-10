package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.InfractionThreatCharacterization

interface InfractionRepository {
    fun findInfractionByNatinfCode(natinfCode: Int): Infraction

    fun findAll(): List<Infraction>

    fun findInfractionsThreatCharacterization(): List<InfractionThreatCharacterization>
}
