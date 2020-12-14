package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Gear
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class JpaGearRepository(@Autowired
                        private val dbGearRepository: DBGearRepository) : GearRepository {

    @Cacheable(value = ["gear"])
    override fun findAll(): List<Gear> {
        return dbGearRepository.findAll().map {
            it.toGear()
        }
    }
}
