package fr.gouv.cnsp.monitorfish.domain.repositories

interface RecentPositionsMetricsRepository {
    fun findSuddenDropOfPositionsReceived(): Boolean
}
