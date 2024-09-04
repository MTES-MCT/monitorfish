package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.district.District
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.DistrictRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBDistrictRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaDistrictRepository(private val dbDistrictRepository: DBDistrictRepository) : DistrictRepository {
    @Cacheable(value = ["district"])
    override fun find(districtCode: String): District {
        return try {
            dbDistrictRepository.findByDistrictCodeEquals(districtCode).toDistrict()
        } catch (e: EmptyResultDataAccessException) {
            throw CodeNotFoundException("District: code $districtCode not found")
        }
    }
}
