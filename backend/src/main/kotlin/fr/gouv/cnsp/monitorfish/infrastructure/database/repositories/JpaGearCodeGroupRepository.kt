package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.gear.GearCodeGroup
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.GearCodeGroupRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBGearCodeGroupRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaGearCodeGroupRepository(
    private val dbGearCodeGroupRepository: DBGearCodeGroupRepository,
) : GearCodeGroupRepository {
    @Cacheable(value = ["gear_code_groups"])
    override fun findAll(): List<GearCodeGroup> {
        return dbGearCodeGroupRepository.findAll().map {
            it.toGearCodeGroup()
        }
    }

    @Cacheable(value = ["gear_code_group"])
    override fun find(code: String): GearCodeGroup {
        return try {
            dbGearCodeGroupRepository.findByCodeEquals(code).toGearCodeGroup()
        } catch (e: EmptyResultDataAccessException) {
            throw CodeNotFoundException("GearCodeGroup: code $code not found")
        }
    }
}
