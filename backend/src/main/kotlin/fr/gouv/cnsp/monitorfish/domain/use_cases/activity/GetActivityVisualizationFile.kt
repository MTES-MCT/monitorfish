package fr.gouv.cnsp.monitorfish.domain.use_cases.activity

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.ActivityVisualizationRepository
import org.slf4j.LoggerFactory

@UseCase
class GetActivityVisualizationFile(
    private val activityVisualizationRepository: ActivityVisualizationRepository
) {
    private val logger = LoggerFactory.getLogger(GetActivityVisualizationFile::class.java)

    fun execute(): String = activityVisualizationRepository.findCurrentActivityVisualization().html
}
