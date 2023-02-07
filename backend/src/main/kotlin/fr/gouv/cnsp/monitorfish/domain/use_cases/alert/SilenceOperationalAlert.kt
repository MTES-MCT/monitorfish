package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilenceAlertPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class SilenceOperationalAlert(
    private val pendingAlertRepository: PendingAlertRepository,
    private val silencedAlertRepository: SilencedAlertRepository,
    private val lastPositionRepository: LastPositionRepository,
) {
    private val logger = LoggerFactory.getLogger(SilenceOperationalAlert::class.java)

    fun execute(
        alertId: Int,
        silenceAlertPeriod: SilenceAlertPeriod,
        beforeDateTime: ZonedDateTime? = null,
    ): SilencedAlert {
        if (silenceAlertPeriod == SilenceAlertPeriod.CUSTOM) {
            requireNotNull(beforeDateTime) {
                "end date must be not null when ignoring an operational alert with a custom period"
            }
        }

        val before = when (silenceAlertPeriod) {
            SilenceAlertPeriod.THIS_OCCURRENCE -> ZonedDateTime.now()
            SilenceAlertPeriod.ONE_HOUR -> ZonedDateTime.now().plusHours(1)
            SilenceAlertPeriod.TWO_HOURS -> ZonedDateTime.now().plusHours(2)
            SilenceAlertPeriod.SIX_HOURS -> ZonedDateTime.now().plusHours(6)
            SilenceAlertPeriod.TWELVE_HOURS -> ZonedDateTime.now().plusHours(12)
            SilenceAlertPeriod.ONE_DAY -> ZonedDateTime.now().plusDays(1)
            SilenceAlertPeriod.ONE_WEEK -> ZonedDateTime.now().plusWeeks(1)
            SilenceAlertPeriod.ONE_MONTH -> ZonedDateTime.now().plusMonths(1)
            SilenceAlertPeriod.ONE_YEAR -> ZonedDateTime.now().plusYears(1)
            SilenceAlertPeriod.CUSTOM -> beforeDateTime!!
        }

        val silencedAlert = pendingAlertRepository.find(alertId)

        val savedSilencedAlert = silencedAlertRepository.save(
            alert = silencedAlert,
            silencedBeforeDate = before,
            isValidated = false,
        )

        pendingAlertRepository.delete(alertId)
        updateLastPositionBeforePipelineUpdate(silencedAlert)
        logger.info("Alert $alertId has been silenced.")

        return savedSilencedAlert
    }

    private fun updateLastPositionBeforePipelineUpdate(silencedAlert: PendingAlert) {
        when (silencedAlert.vesselIdentifier) {
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> {
                require(silencedAlert.internalReferenceNumber != null) {
                    "The fields 'internalReferenceNumber' must be not null when the vessel identifier is INTERNAL_REFERENCE_NUMBER."
                }
                lastPositionRepository.removeAlertToLastPositionByVesselIdentifierEquals(
                    silencedAlert.value.type,
                    silencedAlert.vesselIdentifier,
                    silencedAlert.internalReferenceNumber,
                    isValidated = false,
                )
            }
            VesselIdentifier.IRCS -> {
                require(silencedAlert.ircs != null) {
                    "The fields 'ircs' must be not null when the vessel identifier is IRCS."
                }
                lastPositionRepository.removeAlertToLastPositionByVesselIdentifierEquals(
                    silencedAlert.value.type,
                    silencedAlert.vesselIdentifier,
                    silencedAlert.ircs,
                    isValidated = false,
                )
            }
            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER -> {
                require(silencedAlert.externalReferenceNumber != null) {
                    "The fields 'externalReferenceNumber' must be not null when the vessel identifier is EXTERNAL_REFERENCE_NUMBER."
                }
                lastPositionRepository.removeAlertToLastPositionByVesselIdentifierEquals(
                    silencedAlert.value.type,
                    silencedAlert.vesselIdentifier,
                    silencedAlert.externalReferenceNumber,
                    isValidated = false,
                )
            }
        }
    }
}
