package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSegmentSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos.FullControlUnit

data class PriorNotificationSubscriber(
    val controlUnit: FullControlUnit,
    val portSubscriptions: List<PriorNotificationPortSubscription>,
    val segmentSubscriptions: List<PriorNotificationSegmentSubscription>,
    val vesselSubscriptions: List<PriorNotificationVesselSubscription>,
)
