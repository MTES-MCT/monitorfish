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
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.TestUtils.DUMMY_VESSEL_PROFILE
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime
import kotlin.system.measureTimeMillis

/**
 * Opening a vessel runs about fifteen database queries: they must run in parallel, not one after another
 * (each one costs a round trip to the database, i.e. seconds in total with the production volumes).
 */
class GetVesselConcurrencyUTests {
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

    private fun <T> afterQueryDelay(value: T): T {
        Thread.sleep(QUERY_DELAY_MS)

        return value
    }

    @Test
    fun `execute Should run the database queries in parallel`() {
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
        whenever(getAllUserVesselGroups.execute(any())).thenAnswer { afterQueryDelay(listOf<Any>()) }
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
        var vesselName: String? = null
        val elapsedMs =
            measureTimeMillis {
                // As in `VesselController`
                runBlocking {
                    vesselName =
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
                            ).second.enrichedActiveVessel.vessel
                            ?.vesselName
                }
            }

        // Then
        assertThat(vesselName).isEqualTo(DUMMY_VESSEL.vesselName)
        // The longest chain of dependent queries is 2 (last operation number, then raw message)
        assertThat(elapsedMs).isLessThan(5 * QUERY_DELAY_MS)
    }

    companion object {
        private const val QUERY_DELAY_MS = 200L
    }
}
