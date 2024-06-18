package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup

data class PriorNotificationStats(
    val perSeafrontGroupCount: Map<SeafrontGroup, Int>,
)
