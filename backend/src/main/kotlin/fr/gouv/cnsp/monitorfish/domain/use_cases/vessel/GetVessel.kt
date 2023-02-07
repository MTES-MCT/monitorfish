package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
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
    private val riskFactorsRepository: RiskFactorsRepository,
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
            val (vesselTrackHasBeenModified, positions) = GetVesselPositions(
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

            val vesselFuture = async {
                vesselId?.let { vesselRepository.findVessel(vesselId) }
            }

            val vesselRiskFactorsFuture = async {
                riskFactorsRepository.findVesselRiskFactors(internalReferenceNumber)
            }

            val vessel = vesselFuture.await()
            val vesselWithBeaconNumber = vessel?.id?.let { vesselId ->
                val beaconNumber = beaconRepository.findBeaconNumberByVesselId(vesselId)

                beaconNumber?.let {
                    vessel.copy(beaconNumber = it)
                }
            } ?: vessel

            Pair(
                vesselTrackHasBeenModified,
                VesselInformation(
                    vesselWithBeaconNumber,
                    positions.await(),
                    vesselRiskFactorsFuture.await() ?: VesselRiskFactor(),
                ),
            )
        }
    }
}
