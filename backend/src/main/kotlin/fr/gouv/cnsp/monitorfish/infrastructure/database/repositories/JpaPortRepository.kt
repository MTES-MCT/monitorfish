package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Port
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPortRepository
import org.springframework.beans.factory.annotation.Autowired
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

    @Cacheable(value = ["port"])
    override fun find(code: String): Port {
        return try {
            dbPortRepository.findByLocodeEquals(code).toPort()
        } catch (e: EmptyResultDataAccessException) {
            throw CodeNotFoundException("Port: code $code not found")
        }
    }
}
