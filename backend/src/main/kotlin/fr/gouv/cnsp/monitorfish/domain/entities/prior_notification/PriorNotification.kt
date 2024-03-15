package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripGear
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripSegment

data class PriorNotification(
    val id: Long,
    val expectedArrivalDate: String?,
    val expectedLandingDate: String?,
    val isVesselUnderCharter: Boolean?,
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
    val vesselId: Int,
    val vesselExternalReferenceNumber: String?,
    val vesselFlagCountryCode: String?,
    val vesselInternalReferenceNumber: String?,
    val vesselIrcs: String?,
    val vesselLastControlDate: String?,
    val vesselLength: Double?,
    val vesselMmsi: String?,
    val vesselName: String?,
    val vesselRiskFactorImpact: Double?,
    val vesselRiskFactorProbability: Double?,
    val vesselRiskFactorDetectability: Double?,
    val vesselRiskFactor: Double?,
)
