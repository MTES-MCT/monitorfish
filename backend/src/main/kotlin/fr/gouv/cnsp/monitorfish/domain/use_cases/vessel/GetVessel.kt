package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVesselWithPositions
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.PriorityVesselGroup
import fr.gouv.cnsp.monitorfish.domain.extractBossNameAndAddressFromERS
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.GetAllUserVesselGroups
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVessel(
    private val vesselRepository: VesselRepository,
    private val logbookReportRepository: LogbookReportRepository,
    private val logbookRawMessageRepository: LogbookRawMessageRepository,
    private val getVesselVMSAndAISPositions: GetVesselVMSAndAISPositions,
    private val riskFactorRepository: RiskFactorRepository,
    private val beaconRepository: BeaconRepository,
    private val producerOrganizationMembershipRepository: ProducerOrganizationMembershipRepository,
    private val getAllUserVesselGroups: GetAllUserVesselGroups,
    private val vesselProfileRepository: VesselProfileRepository,
    private val lastPositionRepository: LastPositionRepository,
    private val reportingRepository: ReportingRepository,
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

            val (vesselTrackHasBeenModified, positions) =
                getVesselVMSAndAISPositions.execute(
                    internalReferenceNumber = internalReferenceNumber,
                    externalReferenceNumber = externalReferenceNumber,
                    ircs = ircs,
                    trackDepth = trackDepth,
                    vesselIdentifier = vesselIdentifier,
                    fromDateTime = fromDateTime,
                    toDateTime = toDateTime,
                )

            val reportingsByCfrFuture =
                async {
                    reportingRepository.findAll(
                        ReportingFilter(
                            isArchived = false,
                            isDeleted = false,
                            vesselInternalReferenceNumbers = listOf(internalReferenceNumber),
                        ),
                    )
                }
            val reportingsByVesselIdFuture =
                async {
                    vesselId?.let {
                        reportingRepository.findAll(
                            ReportingFilter(
                                isArchived = false,
                                isDeleted = false,
                                vesselIds = listOf(it),
                            ),
                        )
                    } ?: listOf()
                }
            val vessel =
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
                    getAllUserVesselGroups.execute(userEmail)
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
            val lastLogbookOperationNumber = logbookReportRepository.findLastOperationNumber(internalReferenceNumber)
            val lastLogbookRawMessage =
                lastLogbookOperationNumber?.let {
                    logbookRawMessageRepository.findRawMessage(it)
                }
            val bossNameAndAddress = extractBossNameAndAddressFromERS(lastLogbookRawMessage)

            val allCfrWithVisioCaptures = logbookReportRepository.findAllCfrWithVisioCaptures()
            val hasVisioCaptures = allCfrWithVisioCaptures.firstOrNull { it == internalReferenceNumber } != null

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

            val reportingTypes =
                (
                    reportingsByCfrFuture.await() +
                        reportingsByVesselIdFuture.await()
                ).distinctBy { it.id }
                    .map { it.type }

            val enrichedActiveVessel =
                EnrichedActiveVessel(
                    lastPosition = lastPosition,
                    beacon = beacon.await(),
                    vesselProfile = vesselProfile.await(),
                    vessel =
                        vessel.await()?.copy(
                            hasVisioCaptures = hasVisioCaptures,
                            logbookSoftware = logbookSoftware,
                            bossName = bossNameAndAddress?.first,
                            bossAddress = bossNameAndAddress?.second,
                        ),
                    producerOrganization = vesselProducerOrganization.await(),
                    riskFactor = vesselRiskFactor.await() ?: VesselRiskFactor(),
                    landingPort = null,
                    reportingTypes = reportingTypes,
                )

            val foundVesselGroups =
                userVesselGroups.await().filter { vesselGroup ->
                    when (vesselGroup) {
                        is DynamicVesselGroup -> vesselGroup.containsActiveVessel(enrichedActiveVessel, now)
                        is FixedVesselGroup -> vesselGroup.containsActiveVessel(enrichedActiveVessel)
                        is PriorityVesselGroup -> vesselGroup.containsActiveVessel(enrichedActiveVessel)
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
