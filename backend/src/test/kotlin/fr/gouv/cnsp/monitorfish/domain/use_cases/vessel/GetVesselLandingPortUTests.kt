package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Beacon
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupFilters
import fr.gouv.cnsp.monitorfish.domain.repositories.AisPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookRawMessageRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ProducerOrganizationMembershipRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselProfileRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.DUMMY_VESSEL
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.TestUtils.getDummyLastPositions
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.TestUtils.getDummyPositions
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.GetAllUserVesselGroups
import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import fr.gouv.cnsp.monitorfish.fakers.PriorNotificationFaker
import fr.gouv.cnsp.monitorfish.fakers.VesselFaker
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.TestUtils.DUMMY_VESSEL_PROFILE
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime

class GetVesselLandingPortUTests {
    private val positionRepository: PositionRepository = mock()
    private val aisPositionRepository: AisPositionRepository = mock()
    private val vesselRepository: VesselRepository = mock()
    private val logbookReportRepository: LogbookReportRepository = mock()
    private val logbookRawMessageRepository: LogbookRawMessageRepository = mock()
    private val riskFactorRepository: RiskFactorRepository = mock()
    private val beaconRepository: BeaconRepository = mock()
    private val producerOrganizationMembershipRepository: ProducerOrganizationMembershipRepository = mock()
    private val getAllUserVesselGroups: GetAllUserVesselGroups = mock()
    private val vesselProfileRepository: VesselProfileRepository = mock()
    private val lastPositionRepository: LastPositionRepository = mock()
    private val reportingRepository: ReportingRepository = mock()
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository = mock()

    private fun <T> afterQueryDelay(value: T): T = value

    private val vesselGroupLandingInBrest =
        DynamicVesselGroup(
            id = 1,
            isDeleted = false,
            name = "Landing in Brest",
            description = "",
            pointsOfAttention = "",
            color = "",
            sharing = Sharing.PRIVATE,
            createdBy = "dummy@email.gouv.fr",
            createdAtUtc = ZonedDateTime.now(),
            updatedAtUtc = null,
            endOfValidityUtc = null,
            startOfValidityUtc = null,
            filters =
                VesselGroupFilters(
                    hasLogbook = null,
                    lastControlAtQuayPeriod = null,
                    lastControlAtSeaPeriod = null,
                    landingPortLocodes = listOf("FRBRS"),
                    lastPositionHoursAgo = null,
                    vesselSize = null,
                ),
        )

    @Test
    fun `execute Should return the landing port of the vessel, and match the vessel groups on it`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        whenever(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any()))
            .thenAnswer { afterQueryDelay(getDummyPositions(now)) }
        whenever(aisPositionRepository.findVesselLastAisPositionsByCfr(any(), any(), any()))
            .thenAnswer { afterQueryDelay(listOf<Any>()) }
        whenever(lastPositionRepository.findByVesselIdentifier(any(), any()))
            .thenAnswer { afterQueryDelay(getDummyLastPositions().first()) }
        whenever(vesselRepository.findVesselById(any())).thenAnswer { afterQueryDelay(DUMMY_VESSEL) }
        whenever(logbookReportRepository.findLastReportSoftware(any())).thenAnswer { afterQueryDelay("FT_E-Sacapt") }
        whenever(logbookReportRepository.findLastOperationNumber(any())).thenAnswer { afterQueryDelay("123456") }
        whenever(logbookRawMessageRepository.findRawMessage(any())).thenAnswer { afterQueryDelay(null) }
        whenever(logbookReportRepository.findAllCfrWithVisioCaptures()).thenAnswer { afterQueryDelay(listOf<String>()) }
        whenever(riskFactorRepository.findByVesselId(any())).thenAnswer {
            afterQueryDelay(VesselRiskFactor(2.3, 2.0, 1.9, 3.2))
        }
        whenever(getAllUserVesselGroups.execute(any())).thenReturn(listOf(vesselGroupLandingInBrest))
        whenever(logbookReportRepository.findAllAcknowledgedPriorNotificationsForActiveVessels()).thenReturn(
            listOf(
                PriorNotificationFaker.fakePriorNotification(1).copy(
                    port = PortFaker.fakePort(locode = "FRLRT"),
                    vessel = VesselFaker.fakeVessel(internalReferenceNumber = "ANOTHER_CFR"),
                ),
            ),
        )
        whenever(manualPriorNotificationRepository.findAllForActiveVessels()).thenReturn(
            listOf(
                PriorNotificationFaker.fakePriorNotification(2).copy(
                    port = PortFaker.fakePort(locode = "FRBRS"),
                    vessel = VesselFaker.fakeVessel(internalReferenceNumber = "FR224226850"),
                ),
            ),
        )
        whenever(vesselProfileRepository.findByCfr(any())).thenAnswer { afterQueryDelay(DUMMY_VESSEL_PROFILE) }
        whenever(beaconRepository.findBeaconByVesselId(any())).thenAnswer {
            afterQueryDelay(Beacon("A_BEACON_NUMBER", vesselId = 123))
        }
        whenever(producerOrganizationMembershipRepository.findByInternalReferenceNumber(any())).thenAnswer {
            afterQueryDelay(ProducerOrganizationMembership("FR224226850", "01/10/2024", "Example Name 1"))
        }
        whenever(reportingRepository.findAll(anyOrNull())).thenAnswer { afterQueryDelay(listOf<Any>()) }

        val getVessel =
            GetVessel(
                vesselRepository = vesselRepository,
                logbookReportRepository = logbookReportRepository,
                logbookRawMessageRepository = logbookRawMessageRepository,
                getVesselVMSAndAISPositions =
                    GetVesselVMSAndAISPositions(
                        positionRepository = positionRepository,
                        aisPositionRepository = aisPositionRepository,
                        getDatesFromVesselTrackDepth = GetDatesFromVesselTrackDepth(logbookReportRepository),
                    ),
                riskFactorRepository = riskFactorRepository,
                beaconRepository = beaconRepository,
                producerOrganizationMembershipRepository = producerOrganizationMembershipRepository,
                getAllUserVesselGroups = getAllUserVesselGroups,
                vesselProfileRepository = vesselProfileRepository,
                lastPositionRepository = lastPositionRepository,
                reportingRepository = reportingRepository,
                getVesselLandingPort = GetVesselLandingPort(logbookReportRepository, manualPriorNotificationRepository),
            )

        // When
        val enrichedActiveVessel =
            runBlocking {
                getVessel
                    .execute(
                        vesselId = 123,
                        internalReferenceNumber = "FR224226850",
                        externalReferenceNumber = "",
                        ircs = "",
                        trackDepth = VesselTrackDepth.TWELVE_HOURS,
                        vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                        fromDateTime = null,
                        toDateTime = null,
                        userEmail = "user@gouv.fr",
                    ).second.enrichedActiveVessel
            }

        // Then
        assertThat(enrichedActiveVessel.landingPort?.locode).isEqualTo("FRBRS")
        assertThat(enrichedActiveVessel.vesselGroups.map { it.name }).containsExactly("Landing in Brest")
    }
}
