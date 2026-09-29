package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.district.District
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.DistrictRepository
import fr.gouv.cnsp.monitorfish.infrastructure.cache.CacheName
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBDistrictRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaDistrictRepository(
    private val dbDistrictRepository: DBDistrictRepository,
) : DistrictRepository {
    @Cacheable(value = [CacheName.DISTRICT])
    override fun find(districtCode: String): District =
        try {
            dbDistrictRepository.findByDistrictCodeEquals(districtCode).toDistrict()
        } catch (e: EmptyResultDataAccessException) {
            throw CodeNotFoundException("District: code $districtCode not found")
        }

    @Cacheable(value = [CacheName.DISTRICTS], sync = true)
    override fun findAll() = dbDistrictRepository.findAll().map { it.toDistrict() }
}
