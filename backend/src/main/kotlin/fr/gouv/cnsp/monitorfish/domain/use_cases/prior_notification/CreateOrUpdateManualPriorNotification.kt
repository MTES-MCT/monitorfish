package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationType
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.ComputeFleetSegments
import java.time.ZonedDateTime

@UseCase
class CreateOrUpdateManualPriorNotification(
    private val gearRepository: GearRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
    private val portRepository: PortRepository,
    private val vesselRepository: VesselRepository,

    private val computeFleetSegments: ComputeFleetSegments,
    private val computePnoTypes: ComputePnoTypes,
    private val getPriorNotification: GetPriorNotification,
) {
    fun execute(
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
        tripGearCodes: List<String>,
        vesselId: Int,
    ): PriorNotification {
        val existingPnoMessage = reportId?.let {
            manualPriorNotificationRepository.findByReportId(it)
        }?.logbookMessageTyped?.typedMessage

        val faoAreas = listOf(faoArea)
        val fishingCatchesWithFaoArea = fishingCatches.map { it.copy(faoZone = faoArea) }
        val specyCodes = fishingCatches.mapNotNull { it.species }
        val tripGears = getTripGears(tripGearCodes)
        val tripSegments = computeFleetSegments.execute(faoAreas, tripGearCodes, specyCodes)
            .map { it.toLogbookTripSegment() }
        val vessel = vesselRepository.findVesselById(vesselId)
        val priorNotificationTypes = computePnoTypes.execute(fishingCatchesWithFaoArea, tripGearCodes, vessel.flagState)
            .map { it.toPriorNotificationType() }
        val message = getMessage(
            existingPnoMessage,
            expectedArrivalDate,
            expectedLandingDate,
            // At the moment, manual prior notifications only have a single global FAO area field in Frontend,
            // so we transform that single FAO area into an FAO area per fishing catch.
            fishingCatchesWithFaoArea,
            note,
            priorNotificationTypes,
            portLocode,
        )

        val pnoLogbookMessage = LogbookMessage(
            id = null,
            reportId = reportId,
            operationNumber = null,
            tripNumber = null,
            referencedReportId = null,
            operationDateTime = ZonedDateTime.now(),
            internalReferenceNumber = vessel.internalReferenceNumber,
            externalReferenceNumber = vessel.externalReferenceNumber,
            ircs = vessel.ircs,
            vesselName = vessel.vesselName,
            flagState = vessel.flagState.alpha3,
            imo = vessel.imo,
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
        val createdOrUpdatedPriorNotification = getPriorNotification.execute(newOrCurrentReportId)

        return createdOrUpdatedPriorNotification
    }

    private fun getMessage(
        existingPnoValue: PNO?,
        expectedArrivalDate: String,
        expectedLandingDate: String,
        fishingCatches: List<LogbookFishingCatch>,
        note: String?,
        pnoTypes: List<PriorNotificationType>,
        portLocode: String,
    ): PNO {
        val allPorts = portRepository.findAll()

        val portName = allPorts.find { it.locode == portLocode }?.name
        val predictedArrivalDatetimeUtc = ZonedDateTime.parse(expectedArrivalDate)
        val predictedLandingDatetimeUtc = ZonedDateTime.parse(expectedLandingDate)

        return PNO().apply {
            this.catchOnboard = fishingCatches
            this.catchToLand = fishingCatches
            this.economicZone = null
            this.effortZone = null
            // At the moment, manual prior notifications only have a single global FAO area field in Frontend,
            // so we transform that single FAO area into an FAO area per fishing catch.
            // This means we don't need to set a global PNO message FAO area here.
            this.faoZone = null
            this.isBeingSent = existingPnoValue?.isBeingSent ?: false
            this.isInVerificationScope = existingPnoValue?.isInVerificationScope ?: false
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
            this.purpose = LogbookMessagePurpose.LAN
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
