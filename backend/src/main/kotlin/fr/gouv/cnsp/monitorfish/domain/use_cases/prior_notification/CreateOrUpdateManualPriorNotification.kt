package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.ManualPriorNotificationComputedValues
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationType
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import java.time.ZonedDateTime

@UseCase
class CreateOrUpdateManualPriorNotification(
    private val gearRepository: GearRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
    private val portRepository: PortRepository,
    private val vesselRepository: VesselRepository,
    private val computeManualPriorNotification: ComputeManualPriorNotification,
    private val getPriorNotification: GetPriorNotification,
) {
    fun execute(
        hasPortEntranceAuthorization: Boolean,
        hasPortLandingAuthorization: Boolean,
        authorTrigram: String,
        didNotFishAfterZeroNotice: Boolean,
        expectedArrivalDate: String,
        expectedLandingDate: String,
        faoArea: String,
        fishingCatches: List<LogbookFishingCatch>,
        note: String?,
        portLocode: String,
        reportId: String?,
        sentAt: String,
        purpose: LogbookMessagePurpose,
        tripGearCodes: List<String>,
        vesselId: Int,
    ): PriorNotification {
        val existingManualPriorNotification = reportId?.let { manualPriorNotificationRepository.findByReportId(it) }
        val existingPnoMessage = existingManualPriorNotification?.logbookMessageTyped?.typedMessage

        // /!\ Backend computed vessel risk factor is only used as a real time Frontend indicator.
        // The Backend should NEVER update `risk_factors` DB table, only the pipeline is allowed to update it.
        val computedValues = computeManualPriorNotification.execute(
            faoArea,
            fishingCatches,
            portLocode,
            tripGearCodes,
            vesselId,
        )

        val fishingCatchesWithFaoArea = fishingCatches.map { it.copy(faoZone = faoArea) }
        val tripGears = getTripGears(tripGearCodes)
        val tripSegments = computedValues.tripSegments.map { it.toLogbookTripSegment() }
        val vessel = vesselRepository.findVesselById(vesselId)
        val priorNotificationTypes = computedValues.types.map { it.toPriorNotificationType() }
        val message = getMessage(
            hasPortEntranceAuthorization = hasPortEntranceAuthorization,
            hasPortLandingAuthorization = hasPortLandingAuthorization,
            existingPnoValue = existingPnoMessage,
            expectedArrivalDate = expectedArrivalDate,
            expectedLandingDate = expectedLandingDate,
            // At the moment, manual prior notifications only have a single global FAO area field in Frontend,
            // so we transform that single FAO area into an FAO area per fishing catch.
            fishingCatches = fishingCatchesWithFaoArea,
            note = note,
            pnoTypes = priorNotificationTypes,
            portLocode = portLocode,
            purpose = purpose,
            computedVesselFlagCountryCode = vessel?.flagState,
            computedVesselRiskFactor = computedValues.vesselRiskFactor,
        )

        val pnoLogbookMessage = LogbookMessage(
            id = null,
            reportId = reportId,
            operationNumber = null,
            tripNumber = null,
            referencedReportId = null,
            operationDateTime = ZonedDateTime.now(),
            internalReferenceNumber = vessel?.internalReferenceNumber,
            externalReferenceNumber = vessel?.externalReferenceNumber,
            ircs = vessel?.ircs,
            vesselName = vessel?.vesselName,
            flagState = vessel?.flagState?.alpha3,
            imo = vessel?.imo,
            reportDateTime = ZonedDateTime.parse(sentAt),
            integrationDateTime = ZonedDateTime.now(),
            analyzedByRules = emptyList(),
            rawMessage = null,
            transmissionFormat = null,
            software = null,
            acknowledgment = null,
            isCorrectedByNewerMessage = false,
            isDeleted = false,
            isEnriched = true,
            isSentByFailoverSoftware = false,
            message = message,
            messageType = LogbookMessageTypeMapping.PNO.name,
            operationType = LogbookOperationType.DAT,
            tripGears = tripGears,
            tripSegments = tripSegments,
        )
        val logbookMessageTyped = LogbookMessageTyped(pnoLogbookMessage, PNO::class.java)

        val newOrNextPriorNotification = PriorNotification(
            reportId = reportId,
            authorTrigram = authorTrigram,
            didNotFishAfterZeroNotice = didNotFishAfterZeroNotice,
            isManuallyCreated = true,
            logbookMessageTyped = logbookMessageTyped,
            sentAt = sentAt,

            // All these props are useless for the save operation.
            createdAt = null,
            port = null,
            reportingCount = null,
            seafront = null,
            state = null,
            vessel = null,
            vesselRiskFactor = null,
            updatedAt = null,
        )

        val newOrCurrentReportId = manualPriorNotificationRepository.save(newOrNextPriorNotification)
        val createdOrUpdatedPriorNotification = getPriorNotification.execute(newOrCurrentReportId, true)

        return createdOrUpdatedPriorNotification
    }

    private fun getMessage(
        existingPnoValue: PNO?,
        hasPortEntranceAuthorization: Boolean,
        hasPortLandingAuthorization: Boolean,
        purpose: LogbookMessagePurpose,
        expectedArrivalDate: String,
        expectedLandingDate: String,
        fishingCatches: List<LogbookFishingCatch>,
        note: String?,
        pnoTypes: List<PriorNotificationType>,
        portLocode: String,
        computedVesselFlagCountryCode: CountryCode?,
        computedVesselRiskFactor: Double?,
    ): PNO {
        val allPorts = portRepository.findAll()

        val isInVerificationScope = existingPnoValue?.isInVerificationScope
            ?: ManualPriorNotificationComputedValues
                .computeIsInVerificationScope(computedVesselFlagCountryCode, computedVesselRiskFactor)
        val portName = allPorts.find { it.locode == portLocode }?.name
        val predictedArrivalDatetimeUtc = ZonedDateTime.parse(expectedArrivalDate)
        val predictedLandingDatetimeUtc = ZonedDateTime.parse(expectedLandingDate)

        return PNO().apply {
            this.hasPortEntranceAuthorization = hasPortEntranceAuthorization
            this.hasPortLandingAuthorization = hasPortLandingAuthorization
            this.catchOnboard = fishingCatches
            this.catchToLand = fishingCatches
            this.economicZone = null
            this.effortZone = null
            // At the moment, manual prior notifications only have a single global FAO area field in Frontend,
            // so we transform that single FAO area into an FAO area per fishing catch.
            // This means we don't need to set a global PNO message FAO area here.
            this.faoZone = null
            this.isBeingSent = existingPnoValue?.isBeingSent ?: false
            this.isInVerificationScope = isInVerificationScope
            this.isSent = existingPnoValue?.isSent ?: false
            this.isVerified = existingPnoValue?.isVerified ?: false
            this.latitude = null
            this.longitude = null
            this.note = note
            this.pnoTypes = pnoTypes
            this.port = portLocode
            this.portName = portName
            this.predictedArrivalDatetimeUtc = predictedArrivalDatetimeUtc
            this.predictedLandingDatetimeUtc = predictedLandingDatetimeUtc
            this.purpose = purpose
            this.statisticalRectangle = null
            this.tripStartDate = null
        }
    }

    fun getTripGears(tripGearCodes: List<String>): List<LogbookTripGear> {
        val allGears = gearRepository.findAll()

        return tripGearCodes
            .mapNotNull { gearCode -> allGears.find { it.code == gearCode } }
            .map {
                LogbookTripGear().apply {
                    this.gear = it.code
                    this.gearName = it.name
                    this.mesh = null
                    this.dimensions = null
                }
            }
    }
}
