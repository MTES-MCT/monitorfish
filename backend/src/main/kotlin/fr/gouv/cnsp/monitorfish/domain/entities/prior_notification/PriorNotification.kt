package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripGear
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripSegment
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel

data class PriorNotification(
    val id: Long,
    val expectedArrivalDate: String?,
    val expectedLandingDate: String?,
    val notificationTypeLabel: String? = null,
    val onboardCatches: List<Catch>,
    val portLocode: String?,
    val portName: String? = null,
    val purposeCode: String?,
    val reportingsCount: Int? = null,
    val seaFront: String? = null,
    val sentAt: String?,
    val tripGears: List<LogbookTripGear>,
    val tripSegments: List<LogbookTripSegment>,
    val types: List<PriorNotificationType>,
    val vessel: Vessel,
    val vesselLastControlDate: String?,
    val vesselRiskFactor: Double?,
    val vesselRiskFactorImpact: Double?,
    val vesselRiskFactorProbability: Double?,
    val vesselRiskFactorDetectability: Double?,
)
