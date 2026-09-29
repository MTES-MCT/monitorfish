package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.SpeciesRepository
import fr.gouv.cnsp.monitorfish.infrastructure.cache.CacheName
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBSpeciesRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaSpeciesRepository(
    private val dbSpeciesRepository: DBSpeciesRepository,
) : SpeciesRepository {
    @Cacheable(value = [CacheName.ALL_SPECIES], sync = true)
    override fun findAll(): List<Species> =
        dbSpeciesRepository.findAll().map {
            it.toSpecies()
        }

    @Cacheable(value = [CacheName.SPECIES])
    override fun findByCode(code: String): Species =
        try {
            dbSpeciesRepository.findByCodeEquals(code).toSpecies()
        } catch (e: EmptyResultDataAccessException) {
            throw CodeNotFoundException("Species: code $code not found")
        }
}
