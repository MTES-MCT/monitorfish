package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.infrastructure.cache.CacheName
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPortRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaPortRepository(
    private val dbPortRepository: DBPortRepository,
) : PortRepository {
    @Cacheable(value = [CacheName.PORTS], sync = true)
    override fun findAll(): List<Port> =
        dbPortRepository.findAll().map {
            it.toPort()
        }

    @Cacheable(value = [CacheName.ACTIVE_PORTS], sync = true)
    override fun findAllActive(): List<Port> =
        dbPortRepository.findAllByIsActiveIsTrue().map {
            it.toPort()
        }

    @Cacheable(value = [CacheName.PORT])
    override fun findByLocode(locode: String): Port =
        try {
            dbPortRepository.findByLocodeEquals(locode).toPort()
        } catch (e: EmptyResultDataAccessException) {
            throw CodeNotFoundException("Port: code $locode not found")
        }
}
