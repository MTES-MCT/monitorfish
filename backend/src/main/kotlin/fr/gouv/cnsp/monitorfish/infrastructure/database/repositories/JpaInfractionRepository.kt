package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.InfractionThreatCharacterization
import fr.gouv.cnsp.monitorfish.domain.exceptions.NatinfCodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBInfractionRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaInfractionRepository(
    private val dbInfractionRepository: DBInfractionRepository,
) : InfractionRepository {
    @Cacheable(value = ["infractions"])
    override fun findAll(): List<Infraction> =
        dbInfractionRepository.findAll().map {
            it.toInfraction()
        }

    @Cacheable(value = ["infraction"])
    override fun findInfractionByNatinfCode(natinfCode: Int): Infraction =
        try {
            dbInfractionRepository.findByNatinfCodeEquals(natinfCode).toInfraction()
        } catch (e: EmptyResultDataAccessException) {
            throw NatinfCodeNotFoundException("NATINF code $natinfCode not found")
        }

    @Cacheable(value = ["threat_characterization"])
    override fun findInfractionsThreatCharacterization(): List<InfractionThreatCharacterization> =
        dbInfractionRepository.findInfractionsThreatCharacterization().map {
            InfractionThreatCharacterization(
                natinfCode = it[0] as Int,
                infraction = it[1] as String,
                threat = it[2] as String,
                threatCharacterization = it[3] as String,
            )
        }
}
