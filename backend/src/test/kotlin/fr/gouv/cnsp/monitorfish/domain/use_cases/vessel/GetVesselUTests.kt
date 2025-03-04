package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Beacon
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.DUMMY_VESSEL
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

    @Test
    fun `execute Should return the vessel and an ordered list of last positions for a given vessel`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition =
            Position(
                id = null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                latitude = 16.445,
                longitude = 48.2525,
                speed = 1.8,
                course = 180.0,
                dateTime =
                    now.minusHours(
                        4,
                    ),
            )
        val secondPosition =
            Position(
                id = null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                latitude = 16.445,
                longitude = 48.2525,
                speed = 1.8,
                course = 180.0,
                dateTime =
                    now.minusHours(
                        3,
                    ),
            )
        val thirdPosition =
            Position(
                id = null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                latitude = 16.445,
                longitude = 48.2525,
                speed = 1.8,
                course = 180.0,
                dateTime =
                    now.minusHours(
                        2,
                    ),
            )
        val fourthPosition =
            Position(
                id = null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                latitude = 16.445,
                longitude = 48.2525,
                speed = 1.8,
                course = 180.0,
                dateTime =
                    now.minusHours(
                        1,
                    ),
            )
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(firstPosition, fourthPosition, secondPosition, thirdPosition),
        )
        given(vesselRepository.findVesselById(any())).willReturn(DUMMY_VESSEL)
        given(logbookReportRepository.findLastReportSoftware(any())).willReturn("FT_E-Sacapt")
        given(riskFactorRepository.findByInternalReferenceNumber(any())).willReturn(
            VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
        )
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
                ).execute(
                    vesselId = 123,
                    internalReferenceNumber = "FR224226850",
                    externalReferenceNumber = "",
                    ircs = "",
                    trackDepth = VesselTrackDepth.TWELVE_HOURS,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    fromDateTime = null,
                    toDateTime = null,
                )
            }

        // Then
        assertThat(pair.first).isFalse
        assertThat(pair.second.vessel?.id).isEqualTo(123)
        assertThat(pair.second.vessel?.hasVisioCaptures).isTrue()
        assertThat(pair.second.beacon?.beaconNumber).isEqualTo("A_BEACON_NUMBER")
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
        assertThat(pair.second.vesselRiskFactor?.impactRiskFactor).isEqualTo(2.3)
        assertThat(pair.second.vesselRiskFactor?.riskFactor).isEqualTo(3.2)
        assertThat(pair.second.producerOrganization?.organizationName).isEqualTo("Example Name 1")
    }

    @Test
    fun `execute Should not throw an exception When no Vessel found And return null`() {
        // Given
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(),
        )
        given(vesselRepository.findVesselById(any())).willReturn(null)
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
                ).execute(
                    vesselId = 123,
                    internalReferenceNumber = "FR224226850",
                    externalReferenceNumber = "",
                    ircs = "",
                    trackDepth = VesselTrackDepth.TWELVE_HOURS,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    fromDateTime = null,
                    toDateTime = null,
                )
            }

        // Then
        assertThat(pair.first).isFalse
        assertThat(pair.second.vessel).isNull()
    }

    @Test
    fun `execute Should not throw an exception When no beacon found`() {
        // Given
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(),
        )
        given(vesselRepository.findVesselById(any())).willReturn(null)
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
                ).execute(
                    vesselId = 123,
                    internalReferenceNumber = "FR224226850",
                    externalReferenceNumber = "",
                    ircs = "",
                    trackDepth = VesselTrackDepth.TWELVE_HOURS,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    fromDateTime = null,
                    toDateTime = null,
                )
            }

        // Then
        assertThat(pair.first).isFalse
        assertThat(pair.second.beacon?.beaconNumber).isNull()
    }

    @Test
    fun `execute Should not throw an exception When no vessel id given`() {
        // Given
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(),
        )
        given(vesselRepository.findVesselById(any())).willReturn(null)
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
                ).execute(
                    vesselId = null,
                    internalReferenceNumber = "FR224226850",
                    externalReferenceNumber = "",
                    ircs = "",
                    trackDepth = VesselTrackDepth.TWELVE_HOURS,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    fromDateTime = null,
                    toDateTime = null,
                )
            }

        // Then
        assertThat(pair.second.vessel).isNull()
    }

    @Test
    fun `execute Should return a null risk factor when not found`() {
        // Given
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(),
        )
        given(vesselRepository.findVesselById(any())).willReturn(null)
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
                ).execute(
                    vesselId = null,
                    internalReferenceNumber = "FR224226850",
                    externalReferenceNumber = "",
                    ircs = "",
                    trackDepth = VesselTrackDepth.TWELVE_HOURS,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    fromDateTime = null,
                    toDateTime = null,
                )
            }

        // Then
        assertThat(pair.second.vesselRiskFactor).isNull()
    }
}
