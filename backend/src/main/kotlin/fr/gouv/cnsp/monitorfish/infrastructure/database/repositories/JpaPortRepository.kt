package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPortRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaPortRepository(private val dbPortRepository: DBPortRepository) : PortRepository {

    @Cacheable(value = ["ports"])
    override fun findAll(): List<Port> {
        return dbPortRepository.findAll().map {
            it.toPort()
        }
    }

    @Cacheable(value = ["active_ports"])
    override fun findAllActive(): List<Port> {
        return dbPortRepository.findAllByIsActiveIsTrue().map {
            it.toPort()
        }
    }

    @Cacheable(value = ["port"])
    override fun findByLocode(locode: String): Port {
        return try {
            dbPortRepository.findByLocodeEquals(locode).toPort()
        } catch (e: EmptyResultDataAccessException) {
            throw CodeNotFoundException("Port: code $locode not found")
        }
    }
}
