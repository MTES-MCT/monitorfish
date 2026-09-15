package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.repositories.RecentPositionsMetricsRepository
import fr.gouv.cnsp.monitorfish.infrastructure.cache.CacheName
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBRecentPositionsMetricsRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class JpaRecentPositionsMetricsRepository(
    private val recentPositionsMetricsRepository: DBRecentPositionsMetricsRepository,
) : RecentPositionsMetricsRepository {
    @Cacheable(value = [CacheName.SUDDEN_DROP_OF_POSITIONS_RECEIVED], sync = true)
    override fun findSuddenDropOfPositionsReceived(): Boolean =
        recentPositionsMetricsRepository.findSuddenDropOfPositionsReceived()
}
