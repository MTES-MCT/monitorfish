package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.activity.ActivityVisualization
import fr.gouv.cnsp.monitorfish.domain.repositories.ActivityVisualizationRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBActivityVisualizationRepository
import org.springframework.stereotype.Repository

@Repository
class JpaActivityVisualizationRepository(
    private val dbActivityVisualizationRepository: DBActivityVisualizationRepository,
) : ActivityVisualizationRepository {
    override fun findCurrentActivityVisualization(): ActivityVisualization =
        dbActivityVisualizationRepository.findCurrentActivityVisualization().toActivityVisualization()
}
