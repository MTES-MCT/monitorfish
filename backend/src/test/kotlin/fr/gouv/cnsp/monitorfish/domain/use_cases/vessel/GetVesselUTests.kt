package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.mock
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Beacon
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
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
import org.mockito.Mock
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Import
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@Import(GetVesselPositions::class, GetDatesFromVesselTrackDepth::class)
@ExtendWith(SpringExtension::class)
class GetVesselUTests {
    @MockitoBean
    private lateinit var positionRepository: PositionRepository

    @Mock
    private val reportingRepository: ReportingRepository = mock()

    @MockitoBean
    private lateinit var vesselRepository: VesselRepository

    @MockitoBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockitoBean
    private lateinit var logbookRawMessageRepository: LogbookRawMessageRepository

    @MockitoBean
    private lateinit var riskFactorRepository: RiskFactorRepository

    @MockitoBean
    private lateinit var beaconRepository: BeaconRepository

    @MockitoBean
    private lateinit var producerOrganizationMembershipRepository: ProducerOrganizationMembershipRepository

    @Autowired
    private lateinit var getVesselPositions: GetVesselPositions

    @MockitoBean
    private lateinit var vesselGroupRepository: VesselGroupRepository

    @MockitoBean
    private lateinit var vesselProfileRepository: VesselProfileRepository

    @MockitoBean
    private lateinit var lastPositionRepository: LastPositionRepository

    @MockitoBean
    private lateinit var getAuthorizedUser: GetAuthorizedUser

    @Test
    fun `execute Should return the vessel and an ordered list of last positions for a given vessel`() {
        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            AuthorizedUser(
                email = "dummy@email.gouv.fr",
                isSuperUser = true,
                service = null,
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
        given(logbookReportRepository.findLastOperationNumber(any())).willReturn("123456")
        given(logbookRawMessageRepository.findRawMessage(any())).willReturn(
            """
            <?xml version="1.0" encoding="UTF-8" standalone="yes"?><ers:OPS xmlns:ers="http://ec.europa.eu/fisheries/schema/ers/v3" AD="FRA" FR="OOF" ON="OOF20250704017200" OD="2025-07-04" OT="21:44" EVL="IKTUS 4.6.7"><ers:DAT TM="CU"><ers:ERS RN="OOF20250704017200" RD="2025-07-04" RT="21:44"><ers:LOG IR="XXX" RC="" XR="" NA="VESSEL NAME" MA="Jean Bon" MD="56, rue du Croisic, 44100, Nantes" FS="FRA"><ers:DEP DA="2025-07-04" TI="21:44" PO="FROII" AA="FSH"><ers:GEA GE="OTT" ME="80" GC="17.0;0.0"/></ers:DEP><ers:ELOG Type="nat" CH="FRA" TN="20250055"/></ers:LOG></ers:ERS></ers:DAT></ers:OPS>
            """.trimIndent(),
        )
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
                    logbookRawMessageRepository = logbookRawMessageRepository,
                    getVesselPositions = getVesselPositions,
                    riskFactorRepository = riskFactorRepository,
                    beaconRepository = beaconRepository,
                    producerOrganizationMembershipRepository = producerOrganizationMembershipRepository,
                    vesselGroupRepository = vesselGroupRepository,
                    vesselProfileRepository = vesselProfileRepository,
                    lastPositionRepository = lastPositionRepository,
                    reportingRepository = reportingRepository,
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
            pair.second.enrichedActiveVessel.vessel
                ?.bossAddress,
        ).isEqualTo("56, rue du Croisic, 44100, Nantes")
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
            AuthorizedUser(
                email = "dummy@email.gouv.fr",
                isSuperUser = true,
                service = null,
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
                    logbookRawMessageRepository = logbookRawMessageRepository,
                    getVesselPositions = getVesselPositions,
                    riskFactorRepository = riskFactorRepository,
                    beaconRepository = beaconRepository,
                    producerOrganizationMembershipRepository = producerOrganizationMembershipRepository,
                    vesselGroupRepository = vesselGroupRepository,
                    vesselProfileRepository = vesselProfileRepository,
                    lastPositionRepository = lastPositionRepository,
                    reportingRepository = reportingRepository,
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
            AuthorizedUser(
                email = "dummy@email.gouv.fr",
                isSuperUser = true,
                service = null,
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
                    logbookRawMessageRepository = logbookRawMessageRepository,
                    getVesselPositions = getVesselPositions,
                    riskFactorRepository = riskFactorRepository,
                    beaconRepository = beaconRepository,
                    producerOrganizationMembershipRepository = producerOrganizationMembershipRepository,
                    vesselGroupRepository = vesselGroupRepository,
                    vesselProfileRepository = vesselProfileRepository,
                    lastPositionRepository = lastPositionRepository,
                    reportingRepository = reportingRepository,
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
            AuthorizedUser(
                email = "dummy@email.gouv.fr",
                isSuperUser = true,
                service = null,
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
                    logbookRawMessageRepository = logbookRawMessageRepository,
                    getVesselPositions = getVesselPositions,
                    riskFactorRepository = riskFactorRepository,
                    beaconRepository = beaconRepository,
                    producerOrganizationMembershipRepository = producerOrganizationMembershipRepository,
                    vesselGroupRepository = vesselGroupRepository,
                    vesselProfileRepository = vesselProfileRepository,
                    lastPositionRepository = lastPositionRepository,
                    reportingRepository = reportingRepository,
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
            AuthorizedUser(
                email = "dummy@email.gouv.fr",
                isSuperUser = true,
                service = null,
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
                    logbookRawMessageRepository = logbookRawMessageRepository,
                    getVesselPositions = getVesselPositions,
                    riskFactorRepository = riskFactorRepository,
                    beaconRepository = beaconRepository,
                    producerOrganizationMembershipRepository = producerOrganizationMembershipRepository,
                    vesselGroupRepository = vesselGroupRepository,
                    vesselProfileRepository = vesselProfileRepository,
                    lastPositionRepository = lastPositionRepository,
                    reportingRepository = reportingRepository,
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

    @Test
    fun `execute Should return deduplicated reporting types from findAll by CFR and by vessel id`() {
        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            AuthorizedUser(
                email = "dummy@email.gouv.fr",
                isSuperUser = true,
                service = null,
            ),
        )
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(),
        )
        given(vesselRepository.findVesselById(any())).willReturn(null)
        given(logbookReportRepository.findAllCfrWithVisioCaptures()).willReturn(listOf())
        given(riskFactorRepository.findByInternalReferenceNumber(any())).willReturn(VesselRiskFactor())

        val reportingByCfr =
            Reporting.Observation(
                id = 1,
                vesselId = 123,
                vesselName = "VESSEL",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "EXT",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                isArchived = false,
                isDeleted = false,
                reportingActor = ReportingActor.OPS,
                title = "Observation 1",
                createdBy = "test@example.gouv.fr",
            )
        val reportingByVesselId =
            Reporting.InfractionSuspicion(
                id = 2,
                vesselId = 123,
                vesselName = "VESSEL",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "EXT",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                isArchived = false,
                isDeleted = false,
                reportingActor = ReportingActor.OPS,
                title = "Infraction suspicion",
                natinfCode = 123,
                threat = "threat",
                threatCharacterization = "threat characterization",
                createdBy = "test@example.gouv.fr",
            )
        // Duplicate reporting returned by both queries
        val duplicateReporting =
            Reporting.Observation(
                id = 1,
                vesselId = 123,
                vesselName = "VESSEL",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "EXT",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                isArchived = false,
                isDeleted = false,
                reportingActor = ReportingActor.OPS,
                title = "Observation 1",
                createdBy = "test@example.gouv.fr",
            )

        given(
            reportingRepository.findAll(
                eq(
                    ReportingFilter(
                        isArchived = false,
                        isDeleted = false,
                        vesselInternalReferenceNumbers = listOf("FR224226850"),
                    ),
                ),
            ),
        ).willReturn(listOf(reportingByCfr))
        given(
            reportingRepository.findAll(
                eq(
                    ReportingFilter(
                        isArchived = false,
                        isDeleted = false,
                        vesselIds = listOf(123),
                    ),
                ),
            ),
        ).willReturn(listOf(reportingByVesselId, duplicateReporting))

        // When
        val pair =
            runBlocking {
                GetVessel(
                    vesselRepository = vesselRepository,
                    logbookReportRepository = logbookReportRepository,
                    logbookRawMessageRepository = logbookRawMessageRepository,
                    getVesselPositions = getVesselPositions,
                    riskFactorRepository = riskFactorRepository,
                    beaconRepository = beaconRepository,
                    producerOrganizationMembershipRepository = producerOrganizationMembershipRepository,
                    vesselGroupRepository = vesselGroupRepository,
                    vesselProfileRepository = vesselProfileRepository,
                    lastPositionRepository = lastPositionRepository,
                    reportingRepository = reportingRepository,
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
        assertThat(pair.second.enrichedActiveVessel.reportingTypes).hasSize(2)
        assertThat(pair.second.enrichedActiveVessel.reportingTypes).containsExactlyInAnyOrder(
            ReportingType.OBSERVATION,
            ReportingType.INFRACTION_SUSPICION,
        )
        assertThat(pair.second.enrichedActiveVessel.hasInfractionSuspicion).isTrue()
        assertThat(pair.second.enrichedActiveVessel.numberOfReportings).isEqualTo(2)
    }
}
