package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Gear
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBGearRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaGearRepository(@Autowired
                        private val dbGearRepository: DBGearRepository) : GearRepository {

    @Cacheable(value = ["gears"])
    override fun findAll(): List<Gear> {
        return dbGearRepository.findAll().map {
            it.toGear()
        }
    }

    @Cacheable(value = ["gear"])
    override fun find(code: String): Gear {
        return try {
            dbGearRepository.findByCodeEquals(code).toGear()
        } catch (e: EmptyResultDataAccessException) {
            throw CodeNotFoundException("Gear: code $code not found")
        }
    }
}
