package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class ValidateOperationalAlert(
    private val pendingAlertRepository: PendingAlertRepository,
    private val reportingRepository: ReportingRepository,
    private val silencedAlertRepository: SilencedAlertRepository,
    private val lastPositionRepository: LastPositionRepository,
) {
    private val logger = LoggerFactory.getLogger(ValidateOperationalAlert::class.java)

    fun execute(alertId: Int) {
        val now = ZonedDateTime.now()
        val validatedAlert = pendingAlertRepository.find(alertId)

        silencedAlertRepository.save(
            alert = validatedAlert,
            silencedBeforeDate = now.plusHours(4),
            isValidated = true,
        )

        reportingRepository.save(validatedAlert, now)

        pendingAlertRepository.delete(alertId)
        updateLastPositionBeforePipelineUpdate(validatedAlert)
        logger.info("Alert $alertId has been validated and saved as reporting.")
    }

    private fun updateLastPositionBeforePipelineUpdate(validatedAlert: PendingAlert) {
        when (validatedAlert.vesselIdentifier) {
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> {
                require(validatedAlert.internalReferenceNumber != null) {
                    "The fields 'internalReferenceNumber' must be not null when the vessel identifier is INTERNAL_REFERENCE_NUMBER."
                }
                lastPositionRepository.removeAlertToLastPositionByVesselIdentifierEquals(
                    validatedAlert.value.type,
                    validatedAlert.vesselIdentifier,
                    validatedAlert.internalReferenceNumber,
                    isValidated = true,
                )
            }
            VesselIdentifier.IRCS -> {
                require(validatedAlert.ircs != null) {
                    "The fields 'ircs' must be not null when the vessel identifier is IRCS."
                }
                lastPositionRepository.removeAlertToLastPositionByVesselIdentifierEquals(
                    validatedAlert.value.type,
                    validatedAlert.vesselIdentifier,
                    validatedAlert.ircs,
                    isValidated = true,
                )
            }
            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER -> {
                require(validatedAlert.externalReferenceNumber != null) {
                    "The fields 'externalReferenceNumber' must be not null when the vessel identifier is EXTERNAL_REFERENCE_NUMBER."
                }
                lastPositionRepository.removeAlertToLastPositionByVesselIdentifierEquals(
                    validatedAlert.value.type,
                    validatedAlert.vesselIdentifier,
                    validatedAlert.externalReferenceNumber,
                    isValidated = true,
                )
            }
        }
    }
}
