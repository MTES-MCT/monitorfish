package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookSoftware
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVesselWithPositions
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVessel(
    private val vesselRepository: VesselRepository,
    private val logbookReportRepository: LogbookReportRepository,
    private val getVesselPositions: GetVesselPositions,
    private val riskFactorRepository: RiskFactorRepository,
    private val beaconRepository: BeaconRepository,
    private val producerOrganizationMembershipRepository: ProducerOrganizationMembershipRepository,
    private val vesselGroupRepository: VesselGroupRepository,
    private val vesselProfileRepository: VesselProfileRepository,
    private val lastPositionRepository: LastPositionRepository,
    private val getAuthorizedUser: GetAuthorizedUser,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetVessel::class.java)

    suspend fun execute(
        userEmail: String,
        vesselId: Int?,
        internalReferenceNumber: String,
        externalReferenceNumber: String,
        ircs: String,
        trackDepth: VesselTrackDepth,
        vesselIdentifier: VesselIdentifier?,
        fromDateTime: ZonedDateTime?,
        toDateTime: ZonedDateTime?,
    ): Pair<Boolean, EnrichedActiveVesselWithPositions> =
        coroutineScope {
            val now = ZonedDateTime.now()
            val userService = getAuthorizedUser.execute(userEmail).service

            val (vesselTrackHasBeenModified, positions) =
                getVesselPositions.execute(
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
            val beacon =
                async {
                    vesselId?.let { beaconRepository.findBeaconByVesselId(it) }
                }
            val vesselProducerOrganization =
                async {
                    producerOrganizationMembershipRepository.findByInternalReferenceNumber(internalReferenceNumber)
                }

            val userVesselGroups =
                async {
                    vesselGroupRepository.findAllByUserAndSharing(
                        user = userEmail,
                        service = userService,
                    )
                }
            val vesselProfile =
                async {
                    vesselProfileRepository.findByCfr(internalReferenceNumber)
                }
            val vesselRiskFactor =
                async {
                    getVesselRiskFactor(vesselId, internalReferenceNumber)
                }
            val logbookSoftware = logbookReportRepository.findLastReportSoftware(internalReferenceNumber)
            val hasVisioCaptures =
                logbookSoftware?.let { LogbookSoftware.isVisioCaptureInRealTime(logbookSoftware) } ?: false

            val lastPosition =
                when (vesselIdentifier) {
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER ->
                        lastPositionRepository.findByVesselIdentifier(
                            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                            value = internalReferenceNumber,
                        )
                    VesselIdentifier.IRCS ->
                        lastPositionRepository.findByVesselIdentifier(
                            vesselIdentifier = VesselIdentifier.IRCS,
                            value = ircs,
                        )
                    VesselIdentifier.EXTERNAL_REFERENCE_NUMBER ->
                        lastPositionRepository.findByVesselIdentifier(
                            vesselIdentifier = VesselIdentifier.EXTERNAL_REFERENCE_NUMBER,
                            value = externalReferenceNumber,
                        )
                    null -> null
                }

            val enrichedActiveVessel =
                EnrichedActiveVessel(
                    lastPosition = lastPosition,
                    beacon = beacon.await(),
                    vesselProfile = vesselProfile.await(),
                    vessel =
                        vesselFuture.await()?.copy(
                            hasVisioCaptures = hasVisioCaptures,
                            logbookSoftware = logbookSoftware,
                        ),
                    producerOrganization = vesselProducerOrganization.await(),
                    riskFactor = vesselRiskFactor.await() ?: VesselRiskFactor(),
                )

            val foundVesselGroups =
                userVesselGroups.await().filter { vesselGroup ->
                    when (vesselGroup) {
                        is DynamicVesselGroup -> vesselGroup.containsActiveVessel(enrichedActiveVessel, now)
                        is FixedVesselGroup -> vesselGroup.containsActiveVessel(enrichedActiveVessel)
                    }
                }

            Pair(
                vesselTrackHasBeenModified,
                EnrichedActiveVesselWithPositions(
                    enrichedActiveVessel = enrichedActiveVessel.copy(vesselGroups = foundVesselGroups),
                    positions = positions.await(),
                ),
            )
        }

    private fun getVesselRiskFactor(
        vesselId: Int?,
        internalReferenceNumber: String,
    ): VesselRiskFactor? {
        val riskFactorByVesselId = vesselId?.let { riskFactorRepository.findByVesselId(it) }

        val riskFactor =
            riskFactorByVesselId ?: riskFactorRepository.findByInternalReferenceNumber(internalReferenceNumber)

        return riskFactor
    }
}
