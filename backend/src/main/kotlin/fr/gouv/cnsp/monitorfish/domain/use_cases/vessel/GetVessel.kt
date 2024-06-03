package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookSoftware
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselInformation
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVessel(
    private val vesselRepository: VesselRepository,
    private val positionRepository: PositionRepository,
    private val logbookReportRepository: LogbookReportRepository,
    private val riskFactorRepository: RiskFactorRepository,
    private val beaconRepository: BeaconRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetVessel::class.java)

    suspend fun execute(
        vesselId: Int?,
        internalReferenceNumber: String,
        externalReferenceNumber: String,
        ircs: String,
        trackDepth: VesselTrackDepth,
        vesselIdentifier: VesselIdentifier?,
        fromDateTime: ZonedDateTime? = null,
        toDateTime: ZonedDateTime? = null,
    ): Pair<Boolean, VesselInformation> {
        return coroutineScope {
            val (vesselTrackHasBeenModified, positions) =
                GetVesselPositions(
                    positionRepository,
                    logbookReportRepository,
                ).execute(
                    internalReferenceNumber = internalReferenceNumber,
                    externalReferenceNumber = externalReferenceNumber,
                    ircs = ircs,
                    trackDepth = trackDepth,
                    vesselIdentifier = vesselIdentifier,
                    fromDateTime = fromDateTime,
                    toDateTime = toDateTime,
                )

            val vesselFuture =
                async {
                    vesselId?.let { vesselRepository.findVesselById(vesselId) }
                }

            val vesselRiskFactorsFuture =
                async {
                    riskFactorRepository.findByInternalReferenceNumber(internalReferenceNumber)
                }

            val vessel = vesselFuture.await()
            val beacon = vessel?.id?.let { vesselId -> beaconRepository.findBeaconByVesselId(vesselId) }
            val hasVisioCaptures = hasVisioCaptures(vessel)

            Pair(
                vesselTrackHasBeenModified,
                VesselInformation(
                    vessel?.copy(hasVisioCaptures = hasVisioCaptures),
                    beacon,
                    positions.await(),
                    vesselRiskFactorsFuture.await() ?: VesselRiskFactor(),
                ),
            )
        }
    }

    private fun hasVisioCaptures(vessel: Vessel?) = vessel?.internalReferenceNumber?.let {
        val software = logbookReportRepository.findLastReportSoftware(
            it,
        )

        return@let LogbookSoftware.isVisioCapture(software)
    } ?: false
}
