package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.species.SpeciesGroup
import fr.gouv.cnsp.monitorfish.domain.repositories.SpeciesGroupRepository
import fr.gouv.cnsp.monitorfish.infrastructure.cache.CacheName
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBSpeciesGroupRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class JpaSpeciesGroupRepository(
    private val dbSpeciesGroupRepository: DBSpeciesGroupRepository,
) : SpeciesGroupRepository {
    @Cacheable(value = [CacheName.ALL_SPECIES_GROUPS], sync = true)
    override fun findAll(): List<SpeciesGroup> =
        dbSpeciesGroupRepository.findAll().map {
            it.toSpeciesGroup()
        }
}
