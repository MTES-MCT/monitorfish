package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PnoType
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoTypeRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPnoTypeRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class JpaPnoTypeRepository(private val dbPnoTypeRepository: DBPnoTypeRepository) : PnoTypeRepository {
    @Cacheable(value = ["pno_types"])
    override fun findAll(): List<PnoType> {
        return dbPnoTypeRepository.findAll().map { it.toPnoType() }
    }
}
