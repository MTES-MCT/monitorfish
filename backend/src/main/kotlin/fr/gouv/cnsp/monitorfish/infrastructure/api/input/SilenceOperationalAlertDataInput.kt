package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilenceAlertPeriod
import java.time.ZonedDateTime

data class SilenceOperationalAlertDataInput(
    var silencedAlertPeriod: SilenceAlertPeriod,
    var beforeDateTime: ZonedDateTime? = null,
)
