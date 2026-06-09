package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.DEP
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.logbook.GetLogbookMessages
import java.time.ZonedDateTime

/**
 * A [MissionAction] enriched with vessel attributes (from the `vessels` table) and JPE / logbook
 * (ERS) data for the trip that was current at the control date.
 */
data class EnrichedMissionAction(
    val missionAction: MissionAction,
    val vessel: Vessel? = null,
    val tripNumber: String? = null,
    val pnoReportId: String? = null,
    val pnoPurpose: LogbookMessagePurpose? = null,
    val lastDeparturePortLocode: String? = null,
    val lastDeparturePortName: String? = null,
    val lastDepartureDateTime: ZonedDateTime? = null,
)

@UseCase
class EnrichPublicMissionAction(
    private val vesselRepository: VesselRepository,
    private val logbookReportRepository: LogbookReportRepository,
    private val getLogbookMessages: GetLogbookMessages,
) {
    fun execute(action: MissionAction): EnrichedMissionAction {
        val vessel = action.vesselId?.let { vesselRepository.findVesselById(it) }

        val cfr = action.internalReferenceNumber
        val controlDate = action.actionDatetimeUtc

        // The current trip at the control date = latest trip that had already departed by then.
        // Historical trips come from `trips_snapshot`, so past controls resolve their own trip.
        val trip =
            cfr
                ?.let { logbookReportRepository.findAllTrips(it) }
                ?.lastOrNull { it.startDateTime <= controlDate }

        val messages =
            if (cfr != null && trip != null) {
                getLogbookMessages.execute(
                    internalReferenceNumber = cfr,
                    firstOperationDateTime = trip.firstOperationDateTime,
                    lastOperationDateTime = trip.lastOperationDateTime,
                    tripNumber = trip.tripNumber,
                )
            } else {
                emptyList()
            }

        // `GetLogbookMessages` resolves port names and sets isDeleted / isCorrectedByNewerMessage,
        // and returns only DAT/COR data messages.
        val pno =
            messages
                .filter { it.messageType == "PNO" && !it.isDeleted && !it.isCorrectedByNewerMessage }
                .lastOrNull()
        val dep =
            messages
                .filter { it.messageType == "DEP" && !it.isDeleted && !it.isCorrectedByNewerMessage }
                .lastOrNull()
        val depValue = dep?.message as? DEP

        return EnrichedMissionAction(
            missionAction = action,
            vessel = vessel,
            tripNumber = trip?.tripNumber,
            pnoReportId = pno?.reportId,
            pnoPurpose = (pno?.message as? PNO)?.purpose,
            lastDeparturePortLocode = depValue?.departurePort,
            lastDeparturePortName = depValue?.departurePortName,
            lastDepartureDateTime = depValue?.departureDateTime,
        )
    }
}
