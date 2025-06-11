package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Beacon
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.defaultImpactRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.DUMMY_VESSEL
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.TestUtils.getDummyLastPositions
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.TestUtils.getDummyPositions
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.TestUtils.DUMMY_VESSEL_PROFILE
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@Import(GetVesselPositions::class, GetDatesFromVesselTrackDepth::class)
@ExtendWith(SpringExtension::class)
class GetVesselUTests {
    @MockBean
    private lateinit var positionRepository: PositionRepository

    @MockBean
    private lateinit var vesselRepository: VesselRepository

    @MockBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockBean
    private lateinit var riskFactorRepository: RiskFactorRepository

    @MockBean
    private lateinit var beaconRepository: BeaconRepository

    @MockBean
    private lateinit var producerOrganizationMembershipRepository: ProducerOrganizationMembershipRepository

    @Autowired
    private lateinit var getVesselPositions: GetVesselPositions

    @MockBean
    private lateinit var vesselGroupRepository: VesselGroupRepository

    @MockBean
    private lateinit var vesselProfileRepository: VesselProfileRepository

    @MockBean
    private lateinit var lastPositionRepository: LastPositionRepository

    @MockBean
    private lateinit var getAuthorizedUser: GetAuthorizedUser

    @Test
    fun `execute Should return the vessel and an ordered list of last positions for a given vessel`() {
        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            UserAuthorization(
                hashedEmail = "620726063ea5a8121c70f16f1163c85319ee11f1495e85f63ea107b169864ba0",
                isSuperUser = true,
                service = null,
                isAdministrator = false,
            ),
        )
        val now = ZonedDateTime.now().minusDays(1)
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            getDummyPositions(now),
        )
        given(lastPositionRepository.findByVesselIdentifier(any(), any()))
            .willReturn(getDummyLastPositions().first())
        given(vesselRepository.findVesselById(any())).willReturn(DUMMY_VESSEL)
        given(logbookReportRepository.findLastReportSoftware(any())).willReturn("FT_E-Sacapt")
        given(logbookReportRepository.findAllCfrWithVisioCaptures()).willReturn(listOf("FR224226850"))
        given(riskFactorRepository.findByInternalReferenceNumber(any())).willReturn(
            VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
        )
        given(
            vesselGroupRepository.findAllByUserAndSharing(any(), anyOrNull()),
        ).willReturn(TestUtils.getDynamicVesselGroups())
        given(vesselProfileRepository.findByCfr(any())).willReturn(DUMMY_VESSEL_PROFILE)
        given(beaconRepository.findBeaconByVesselId(eq(123))).willReturn(Beacon("A_BEACON_NUMBER", vesselId = 123))
        given(producerOrganizationMembershipRepository.findByInternalReferenceNumber(any())).willReturn(
            ProducerOrganizationMembership("FR224226850", "01/10/2024", "Example Name 1"),
        )

        // When
        val pair =
            runBlocking {
                GetVessel(
                    vesselRepository = vesselRepository,
                    logbookReportRepository = logbookReportRepository,
                    getVesselPositions = getVesselPositions,
                    riskFactorRepository = riskFactorRepository,
                    beaconRepository = beaconRepository,
                    producerOrganizationMembershipRepository = producerOrganizationMembershipRepository,
                    vesselGroupRepository = vesselGroupRepository,
                    vesselProfileRepository = vesselProfileRepository,
                    lastPositionRepository = lastPositionRepository,
                    getAuthorizedUser = getAuthorizedUser,
                ).execute(
                    vesselId = 123,
                    internalReferenceNumber = "FR224226850",
                    externalReferenceNumber = "",
                    ircs = "",
                    trackDepth = VesselTrackDepth.TWELVE_HOURS,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    fromDateTime = null,
                    toDateTime = null,
                    userEmail = "user@gouv.fr",
                )
            }

        // Then
        assertThat(pair.first).isFalse
        assertThat(
            pair.second.enrichedActiveVessel.vessel
                ?.id,
        ).isEqualTo(123)
        assertThat(
            pair.second.enrichedActiveVessel.vessel
                ?.hasVisioCaptures,
        ).isTrue()
        assertThat(
            pair.second.enrichedActiveVessel.beacon
                ?.beaconNumber,
        ).isEqualTo("A_BEACON_NUMBER")
        assertThat(
            pair.second.positions
                .first()
                .dateTime,
        ).isEqualTo(now.minusHours(4))
        assertThat(
            pair.second.positions
                .last()
                .dateTime,
        ).isEqualTo(now.minusHours(1))
        assertThat(pair.second.enrichedActiveVessel.riskFactor.impactRiskFactor).isEqualTo(2.3)
        assertThat(pair.second.enrichedActiveVessel.riskFactor.riskFactor).isEqualTo(3.2)
        assertThat(
            pair.second.enrichedActiveVessel.producerOrganization
                ?.organizationName,
        ).isEqualTo("Example Name 1")
        assertThat(
            pair.second.enrichedActiveVessel.vesselProfile
                ?.species,
        ).hasSize(37)
        assertThat(pair.second.enrichedActiveVessel.vesselGroups).hasSize(1)
        assertThat(
            pair.second.enrichedActiveVessel.vesselGroups
                .first()
                .name,
        ).isEqualTo("Mission Thémis – chaluts de fonds")
    }

    @Test
    fun `execute Should not throw an exception When no Vessel found And return null`() {
        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            UserAuthorization(
                hashedEmail = "620726063ea5a8121c70f16f1163c85319ee11f1495e85f63ea107b169864ba0",
                isSuperUser = true,
                service = null,
                isAdministrator = false,
            ),
        )
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(),
        )
        given(vesselRepository.findVesselById(any())).willReturn(null)
        given(logbookReportRepository.findAllCfrWithVisioCaptures()).willReturn(listOf())
        given(riskFactorRepository.findByInternalReferenceNumber(any())).willReturn(VesselRiskFactor())

        // When
        val pair =
            runBlocking {
                GetVessel(
                    vesselRepository = vesselRepository,
                    logbookReportRepository = logbookReportRepository,
                    getVesselPositions = getVesselPositions,
                    riskFactorRepository = riskFactorRepository,
                    beaconRepository = beaconRepository,
                    producerOrganizationMembershipRepository = producerOrganizationMembershipRepository,
                    vesselGroupRepository = vesselGroupRepository,
                    vesselProfileRepository = vesselProfileRepository,
                    lastPositionRepository = lastPositionRepository,
                    getAuthorizedUser = getAuthorizedUser,
                ).execute(
                    vesselId = 123,
                    internalReferenceNumber = "FR224226850",
                    externalReferenceNumber = "",
                    ircs = "",
                    trackDepth = VesselTrackDepth.TWELVE_HOURS,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    fromDateTime = null,
                    toDateTime = null,
                    userEmail = "user@gouv.fr",
                )
            }

        // Then
        assertThat(pair.first).isFalse
        assertThat(pair.second.enrichedActiveVessel.vessel).isNull()
    }

    @Test
    fun `execute Should not throw an exception When no beacon found`() {
        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            UserAuthorization(
                hashedEmail = "620726063ea5a8121c70f16f1163c85319ee11f1495e85f63ea107b169864ba0",
                isSuperUser = true,
                service = null,
                isAdministrator = false,
            ),
        )
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(),
        )
        given(vesselRepository.findVesselById(any())).willReturn(null)
        given(logbookReportRepository.findAllCfrWithVisioCaptures()).willReturn(listOf())
        given(riskFactorRepository.findByInternalReferenceNumber(any())).willReturn(VesselRiskFactor())
        given(beaconRepository.findBeaconByVesselId(eq(123))).willReturn(null)

        // When
        val pair =
            runBlocking {
                GetVessel(
                    vesselRepository = vesselRepository,
                    logbookReportRepository = logbookReportRepository,
                    getVesselPositions = getVesselPositions,
                    riskFactorRepository = riskFactorRepository,
                    beaconRepository = beaconRepository,
                    producerOrganizationMembershipRepository = producerOrganizationMembershipRepository,
                    vesselGroupRepository = vesselGroupRepository,
                    vesselProfileRepository = vesselProfileRepository,
                    lastPositionRepository = lastPositionRepository,
                    getAuthorizedUser = getAuthorizedUser,
                ).execute(
                    vesselId = 123,
                    internalReferenceNumber = "FR224226850",
                    externalReferenceNumber = "",
                    ircs = "",
                    trackDepth = VesselTrackDepth.TWELVE_HOURS,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    fromDateTime = null,
                    toDateTime = null,
                    userEmail = "user@gouv.fr",
                )
            }

        // Then
        assertThat(pair.first).isFalse
        assertThat(
            pair.second.enrichedActiveVessel.beacon
                ?.beaconNumber,
        ).isNull()
    }

    @Test
    fun `execute Should not throw an exception When no vessel id given`() {
        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            UserAuthorization(
                hashedEmail = "620726063ea5a8121c70f16f1163c85319ee11f1495e85f63ea107b169864ba0",
                isSuperUser = true,
                service = null,
                isAdministrator = false,
            ),
        )
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(),
        )
        given(vesselRepository.findVesselById(any())).willReturn(null)
        given(logbookReportRepository.findAllCfrWithVisioCaptures()).willReturn(listOf())
        given(riskFactorRepository.findByInternalReferenceNumber(any())).willReturn(VesselRiskFactor())
        given(beaconRepository.findBeaconByVesselId(eq(123))).willReturn(null)

        // When
        val pair =
            runBlocking {
                GetVessel(
                    vesselRepository = vesselRepository,
                    logbookReportRepository = logbookReportRepository,
                    getVesselPositions = getVesselPositions,
                    riskFactorRepository = riskFactorRepository,
                    beaconRepository = beaconRepository,
                    producerOrganizationMembershipRepository = producerOrganizationMembershipRepository,
                    vesselGroupRepository = vesselGroupRepository,
                    vesselProfileRepository = vesselProfileRepository,
                    lastPositionRepository = lastPositionRepository,
                    getAuthorizedUser = getAuthorizedUser,
                ).execute(
                    vesselId = null,
                    internalReferenceNumber = "FR224226850",
                    externalReferenceNumber = "",
                    ircs = "",
                    trackDepth = VesselTrackDepth.TWELVE_HOURS,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    fromDateTime = null,
                    toDateTime = null,
                    userEmail = "user@gouv.fr",
                )
            }

        // Then
        assertThat(pair.second.enrichedActiveVessel.vessel).isNull()
    }

    @Test
    fun `execute Should return a default risk factor when not found`() {
        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            UserAuthorization(
                hashedEmail = "620726063ea5a8121c70f16f1163c85319ee11f1495e85f63ea107b169864ba0",
                isSuperUser = true,
                service = null,
                isAdministrator = false,
            ),
        )
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(),
        )
        given(vesselRepository.findVesselById(any())).willReturn(null)
        given(logbookReportRepository.findAllCfrWithVisioCaptures()).willReturn(listOf())
        given(riskFactorRepository.findByVesselId(any())).willReturn(null)
        given(riskFactorRepository.findByInternalReferenceNumber(any())).willReturn(null)
        given(beaconRepository.findBeaconByVesselId(eq(123))).willReturn(null)

        // When
        val pair =
            runBlocking {
                GetVessel(
                    vesselRepository = vesselRepository,
                    logbookReportRepository = logbookReportRepository,
                    getVesselPositions = getVesselPositions,
                    riskFactorRepository = riskFactorRepository,
                    beaconRepository = beaconRepository,
                    producerOrganizationMembershipRepository = producerOrganizationMembershipRepository,
                    vesselGroupRepository = vesselGroupRepository,
                    vesselProfileRepository = vesselProfileRepository,
                    lastPositionRepository = lastPositionRepository,
                    getAuthorizedUser = getAuthorizedUser,
                ).execute(
                    vesselId = null,
                    internalReferenceNumber = "FR224226850",
                    externalReferenceNumber = "",
                    ircs = "",
                    trackDepth = VesselTrackDepth.TWELVE_HOURS,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    fromDateTime = null,
                    toDateTime = null,
                    userEmail = "user@gouv.fr",
                )
            }

        // Then
        assertThat(pair.second.enrichedActiveVessel.riskFactor.impactRiskFactor).isEqualTo(defaultImpactRiskFactor)
    }
}
