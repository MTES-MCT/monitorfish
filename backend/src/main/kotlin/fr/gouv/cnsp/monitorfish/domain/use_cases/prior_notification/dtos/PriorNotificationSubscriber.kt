package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.control_units.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSegmentSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription

data class PriorNotificationSubscriber(
    val legacyControlUnit: LegacyControlUnit,
    val portSubscriptions: List<PriorNotificationPortSubscription>,
    val segmentSubscriptions: List<PriorNotificationSegmentSubscription>,
    val vesselSubscriptions: List<PriorNotificationVesselSubscription>,
)
