package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilenceAlertPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class SilenceOperationalAlert(private val pendingAlertRepository: PendingAlertRepository,
                              private val silencedAlertRepository: SilencedAlertRepository) {
    private val logger = LoggerFactory.getLogger(SilenceOperationalAlert::class.java)

    fun execute(alertId: Int,
                silenceAlertPeriod: SilenceAlertPeriod,
                afterDateTime: ZonedDateTime? = null,
                beforeDateTime: ZonedDateTime? = null): SilencedAlert {
        if(silenceAlertPeriod == SilenceAlertPeriod.CUSTOM) {
            requireNotNull(afterDateTime) {
                "begin date must be not null when ignoring an operational alert with a custom period"
            }
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
            SilenceAlertPeriod.ONE_YEAR ->  ZonedDateTime.now().plusYears(1)
            SilenceAlertPeriod.CUSTOM -> beforeDateTime!!
        }

        val after = when (silenceAlertPeriod) {
            SilenceAlertPeriod.CUSTOM -> afterDateTime
            else -> null
        }

        val silencedAlert = pendingAlertRepository.find(alertId)

        val savedSilencedAlert = silencedAlertRepository.save(
                alert = silencedAlert,
                silencedAfterDate = after,
                silencedBeforeDate = before)

        pendingAlertRepository.delete(alertId)
        logger.info("Alert $alertId has been silenced.")

        return savedSilencedAlert
    }
}
