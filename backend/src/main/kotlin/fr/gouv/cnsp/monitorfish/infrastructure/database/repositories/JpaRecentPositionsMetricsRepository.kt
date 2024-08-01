package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.repositories.RecentPositionsMetricsRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBRecentPositionsMetricsRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class JpaRecentPositionsMetricsRepository(
    private val recentPositionsMetricsRepository: DBRecentPositionsMetricsRepository,
) : RecentPositionsMetricsRepository {

    @Cacheable(value = ["sudden_drop_of_positions_received"])
    override fun findSuddenDropOfPositionsReceived(): Boolean {
        return recentPositionsMetricsRepository.findSuddenDropOfPositionsReceived()
    }
}
