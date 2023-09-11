package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.exceptions.NatinfCodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBInfractionRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaInfractionRepository(private val dbInfractionRepository: DBInfractionRepository) : InfractionRepository {
    @Cacheable(value = ["infractions"])
    override fun findAll(): List<Infraction> {
        return dbInfractionRepository.findAll().map {
            it.toInfraction()
        }
    }

    @Cacheable(value = ["infraction"])
    override fun findInfractionByNatinfCode(natinfCode: Int): Infraction {
        return try {
            dbInfractionRepository.findByNatinfCodeEquals(natinfCode).toInfraction()
        } catch (e: EmptyResultDataAccessException) {
            throw NatinfCodeNotFoundException("NATINF code $natinfCode not found")
        }
    }
}
