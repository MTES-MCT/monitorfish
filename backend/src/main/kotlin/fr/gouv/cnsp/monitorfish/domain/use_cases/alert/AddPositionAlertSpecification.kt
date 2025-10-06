package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlertSpecification
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertSpecificationRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class AddPositionAlertSpecification(
    private val positionAlertSpecificationRepository: PositionAlertSpecificationRepository,
) {
    private val logger = LoggerFactory.getLogger(AddPositionAlertSpecification::class.java)

    fun execute(
        userEmail: String,
        alertSpecification: PositionAlertSpecification,
    ) {
        val enrichedAlertSpecification =
            alertSpecification.copy(
                isActivated = true,
                createdBy = userEmail,
                createdAtUtc = ZonedDateTime.now(),
            )

        positionAlertSpecificationRepository.save(enrichedAlertSpecification)
    }
}
