package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.activity.ActivityVisualization

interface ActivityVisualizationRepository {
    fun findCurrentActivityVisualization(): ActivityVisualization
}
