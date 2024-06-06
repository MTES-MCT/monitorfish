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
import java.time.ZonedDateTime

@UseCase
class CreateOrUpdatePriorNotification(
    private val gearRepository: GearRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
    private val portRepository: PortRepository,
    private val vesselRepository: VesselRepository,

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
        val message = getMessage(faoArea, expectedArrivalDate, expectedLandingDate, fishingCatches, portLocode)
        val tripGears = getTripGears(tripGearCodes)
        // TODO To calculate.
        val tripSegments = emptyList<LogbookTripSegment>()
        val vessel = vesselRepository.findVesselById(vesselId)

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
            messageType = "PNO",
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
            note = note,
            sentAt = sentAt,

            // All these props are useless for the save operation.
            createdAt = null,
            port = null,
            reportingCount = null,
            seafront = null,
            vessel = null,
            vesselRiskFactor = null,
            updatedAt = null,
        )

        val newOrCurrentReportId = manualPriorNotificationRepository.save(newOrNextPriorNotification)
        val createdOrUpdatedPriorNotification = getPriorNotification.execute(newOrCurrentReportId)

        return createdOrUpdatedPriorNotification
    }

    private fun getMessage(
        faoArea: String,
        expectedArrivalDate: String,
        expectedLandingDate: String,
        fishingCatches: List<LogbookFishingCatch>,
        portLocode: String,
    ): PNO {
        val allPorts = portRepository.findAll()

        // TODO To calculate.
        val pnoTypes = emptyList<PriorNotificationType>()
        val portName = allPorts.find { it.locode == portLocode }?.name
        val predictedArrivalDatetimeUtc = ZonedDateTime.parse(expectedArrivalDate)
        val predictedLandingDatetimeUtc = ZonedDateTime.parse(expectedLandingDate)

        return PNO().apply {
            this.catchOnboard = fishingCatches
            this.catchToLand = fishingCatches
            this.economicZone = null
            this.effortZone = null
            this.faoZone = faoArea
            this.latitude = null
            this.longitude = null
            this.pnoTypes = pnoTypes
            this.port = portLocode
            this.portName = portName
            this.predictedArrivalDatetimeUtc = predictedArrivalDatetimeUtc
            this.predictedLandingDatetimeUtc = predictedLandingDatetimeUtc
            this.purpose = "LAN"
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
