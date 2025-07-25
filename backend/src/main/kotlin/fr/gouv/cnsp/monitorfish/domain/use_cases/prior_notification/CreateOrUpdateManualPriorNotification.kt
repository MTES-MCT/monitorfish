package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationType
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class CreateOrUpdateManualPriorNotification(
    private val gearRepository: GearRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
    private val pnoFleetSegmentSubscriptionRepository: PnoFleetSegmentSubscriptionRepository,
    private val pnoPortSubscriptionRepository: PnoPortSubscriptionRepository,
    private val pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository,
    private val portRepository: PortRepository,
    private val priorNotificationPdfDocumentRepository: PriorNotificationPdfDocumentRepository,
    private val vesselRepository: VesselRepository,
    private val computeManualPriorNotification: ComputeManualPriorNotification,
    private val getPriorNotification: GetPriorNotification,
) {
    private val logger: Logger = LoggerFactory.getLogger(CreateOrUpdateManualPriorNotification::class.java)

    fun execute(
        reportId: String?,
        author: String?,
        didNotFishAfterZeroNotice: Boolean,
        expectedArrivalDate: ZonedDateTime,
        expectedLandingDate: ZonedDateTime,
        fishingCatches: List<LogbookFishingCatch>,
        /**
         * Single FAO area shared by all fishing catches.
         *
         * Take precedence over the FAO area of each fishing catch if set.
         */
        globalFaoArea: String?,
        hasPortEntranceAuthorization: Boolean,
        hasPortLandingAuthorization: Boolean,
        note: String?,
        portLocode: String,
        purpose: LogbookMessagePurpose,
        sentAt: ZonedDateTime,
        tripGearCodes: List<String>,
        vesselId: Int,
    ): PriorNotification {
        val existingManualPriorNotification =
            reportId?.let {
                manualPriorNotificationRepository.findByReportId(reportId)
            }
        val existingMessageValue: PNO? =
            existingManualPriorNotification
                ?.logbookMessageAndValue
                ?.logbookMessage
                ?.message as PNO?

        // /!\ Backend computed vessel risk factor is only used as a real time Frontend indicator.
        // The Backend should NEVER update `risk_factors` DB table, only the pipeline is allowed to update it.
        val computedValues =
            computeManualPriorNotification.execute(
                fishingCatches = fishingCatches,
                globalFaoArea = globalFaoArea,
                portLocode = portLocode,
                tripGearCodes = tripGearCodes,
                vesselId = vesselId,
                year = expectedLandingDate.year,
            )

        val isPartOfControlUnitSubscriptions =
            pnoPortSubscriptionRepository.has(portLocode) ||
                pnoVesselSubscriptionRepository.has(vesselId) ||
                pnoFleetSegmentSubscriptionRepository.has(portLocode, computedValues.tripSegments.map { it.segment })

        val fishingCatchesWithFaoArea =
            globalFaoArea?.let { fishingCatches.map { it.copy(faoZone = globalFaoArea) } }
                ?: fishingCatches
        val tripGears = getTripGears(tripGearCodes)
        val tripSegments = computedValues.tripSegments.map { it.toLogbookTripSegment() }
        val vessel = vesselRepository.findVesselById(vesselId)
        val priorNotificationTypes = computedValues.types.map { it.toPriorNotificationType() }
        val messageValue =
            getMessageValue(
                existingMessageValue = existingMessageValue,
                expectedArrivalDate = expectedArrivalDate,
                expectedLandingDate = expectedLandingDate,
                // At the moment, manual prior notifications only have a single global FAO area field in Frontend,
                // so we transform that single FAO area into an FAO area per fishing catch.
                fishingCatches = fishingCatchesWithFaoArea,
                hasPortEntranceAuthorization = hasPortEntranceAuthorization,
                hasPortLandingAuthorization = hasPortLandingAuthorization,
                note = note,
                pnoTypes = priorNotificationTypes,
                portLocode = portLocode,
                purpose = purpose,
                author = author,
                isInVerificationScope = computedValues.isInVerificationScope,
                computedVesselRiskFactor = computedValues.vesselRiskFactor,
                isPartOfControlUnitSubscriptions = isPartOfControlUnitSubscriptions,
            )

        val pnoLogbookMessage =
            LogbookMessage(
                id = null,
                reportId = reportId,
                operationNumber = null,
                tripNumber = null,
                referencedReportId = null,
                operationDateTime = ZonedDateTime.now(),
                activityDateTime = expectedArrivalDate,
                internalReferenceNumber = vessel?.internalReferenceNumber,
                externalReferenceNumber = vessel?.externalReferenceNumber,
                ircs = vessel?.ircs,
                vesselName = vessel?.vesselName,
                vesselId = vesselId,
                flagState = vessel?.flagState?.alpha3,
                imo = vessel?.imo,
                reportDateTime = sentAt,
                integrationDateTime = ZonedDateTime.now(),
                rawMessage = null,
                transmissionFormat = LogbookTransmissionFormat.MANUAL,
                software = null,
                acknowledgment = null,
                isCorrectedByNewerMessage = false,
                isDeleted = false,
                isEnriched = true,
                isSentByFailoverSoftware = false,
                message = messageValue,
                messageType = LogbookMessageTypeMapping.PNO.name,
                operationType = LogbookOperationType.DAT,
                tripGears = tripGears,
                tripSegments = tripSegments,
            )
        val logbookMessageAndValue = LogbookMessageAndValue(pnoLogbookMessage, PNO::class.java)

        val newOrNextPriorNotification =
            PriorNotification(
                reportId = reportId,
                didNotFishAfterZeroNotice = didNotFishAfterZeroNotice,
                isManuallyCreated = true,
                logbookMessageAndValue = logbookMessageAndValue,
                sentAt = sentAt,
                createdAt = existingManualPriorNotification?.createdAt,
                // All these props are useless for the save operation.
                port = null,
                reportingCount = null,
                seafront = null,
                vessel = null,
                lastControlDateTime = null,
                updatedAt = null,
            )

        // Any update must trigger a new PDF generation, so we delete the existing PDF document
        // which is re-generated by the Pipeline each time a PDF is deleted
        if (reportId !== null) {
            try {
                priorNotificationPdfDocumentRepository.deleteByReportId(reportId)
            } catch (e: Exception) {
                logger.warn("Could not delete existing PDF document", e)
            }
        }

        val createdOrUpdatedIncompletePriorNotification =
            manualPriorNotificationRepository.save(newOrNextPriorNotification)
        val createdOrUpdatedPriorNotification =
            getPriorNotification.execute(
                createdOrUpdatedIncompletePriorNotification.reportId!!,
                createdOrUpdatedIncompletePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime,
                true,
            )

        return createdOrUpdatedPriorNotification
    }

    private fun getMessageValue(
        existingMessageValue: PNO?,
        purpose: LogbookMessagePurpose,
        expectedArrivalDate: ZonedDateTime,
        expectedLandingDate: ZonedDateTime,
        fishingCatches: List<LogbookFishingCatch>,
        hasPortEntranceAuthorization: Boolean,
        hasPortLandingAuthorization: Boolean,
        note: String?,
        pnoTypes: List<PriorNotificationType>,
        portLocode: String,
        author: String?,
        computedVesselRiskFactor: Double?,
        isPartOfControlUnitSubscriptions: Boolean,
        isInVerificationScope: Boolean,
    ): PNO {
        val allPorts = portRepository.findAll()

        val authorTrigram = existingMessageValue?.authorTrigram
        val createdBy = existingMessageValue?.createdBy ?: existingMessageValue?.authorTrigram ?: author

        // If the prior notification is not in verification scope,
        // we pass `isBeingSent` as `true` in order to ask the workflow to send it.
        val isBeingSent = !isInVerificationScope && isPartOfControlUnitSubscriptions
        val portName = allPorts.find { it.locode == portLocode }?.name

        return PNO().apply {
            this.authorTrigram = authorTrigram
            this.catchOnboard = fishingCatches
            this.catchToLand = fishingCatches
            this.createdBy = createdBy
            this.economicZone = null
            this.effortZone = null
            // At the moment, manual prior notifications only have a single global FAO area field in Frontend,
            // so we transform that single FAO area into an FAO area per fishing catch.
            // This means we don't need to set a global PNO message FAO area here.
            this.faoZone = null
            this.hasPortEntranceAuthorization = hasPortEntranceAuthorization
            this.hasPortLandingAuthorization = hasPortLandingAuthorization
            // If the prior notification is not in verification scope,
            // we pass `isBeingSent` as `true` in order to ask the workflow to send it.
            this.isBeingSent = isBeingSent
            this.isInVerificationScope = isInVerificationScope
            this.isSent = false
            this.isVerified = false
            this.latitude = null
            this.longitude = null
            this.note = note
            this.pnoTypes = pnoTypes
            this.port = portLocode
            this.portName = portName
            this.predictedArrivalDatetimeUtc = expectedArrivalDate
            this.predictedLandingDatetimeUtc = expectedLandingDate
            this.purpose = purpose
            this.statisticalRectangle = null
            this.tripStartDate = null
            this.riskFactor = computedVesselRiskFactor
            this.updatedBy = author
            this.updatedAt = ZonedDateTime.now()
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
