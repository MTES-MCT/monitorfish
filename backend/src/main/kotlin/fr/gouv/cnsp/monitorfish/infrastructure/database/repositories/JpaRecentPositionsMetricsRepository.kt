package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.repositories.RecentPositionsMetricsRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBRecentPositionsMetricsRepository
import org.springframework.stereotype.Repository

@Repository
class JpaRecentPositionsMetricsRepository(
    private val recentPositionsMetricsRepository: DBRecentPositionsMetricsRepository,
) : RecentPositionsMetricsRepository {

    override fun findSuddenDropOfPositionsReceived(): Boolean {
        return recentPositionsMetricsRepository.findSuddenDropOfPositionsReceived()
    }
}
