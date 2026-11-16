package fr.gouv.cnsp.monitorfish.infrastructure.api.referential

import fr.gouv.cnsp.monitorfish.infrastructure.cache.CacheName
import org.springframework.cache.CacheManager
import org.springframework.stereotype.Component

/**
 * The referentials invalidated by their writer (pipeline flows, backoffice), with the caches holding their content.
 */
enum class Referential(
    val cacheNames: List<String>,
) {
    INFRACTIONS(
        listOf(
            CacheName.INFRACTION,
            CacheName.INFRACTIONS,
            CacheName.THREAT_CHARACTERIZATION,
            CacheName.REFERENTIAL_INFRACTIONS,
        ),
    ),
    PORTS(listOf(CacheName.ACTIVE_PORTS, CacheName.PORT, CacheName.PORTS, CacheName.REFERENTIAL_PORTS)),
    REGULATIONS(listOf(CacheName.REFERENTIAL_REGULATIONS)),
    SPECIES(
        listOf(
            CacheName.ALL_SPECIES,
            CacheName.ALL_SPECIES_GROUPS,
            CacheName.SPECIES,
            CacheName.REFERENTIAL_SPECIES,
        ),
    ),
}

@Component
class ReferentialInvalidation(
    private val cacheManager: CacheManager,
) {
    fun invalidate(referential: Referential) {
        referential.cacheNames.forEach { cacheManager.getCache(it)?.invalidate() }
    }
}
