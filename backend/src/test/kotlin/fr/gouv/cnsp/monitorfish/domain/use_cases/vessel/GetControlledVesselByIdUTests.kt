package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionThreat
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ProducerOrganizationMembershipRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselProfileRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.GetAllUserVesselGroups
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.Mock
import java.time.ZonedDateTime

class GetControlledVesselByIdUTests {
    @Mock
    private val vesselRepository: VesselRepository = mock()

    @Mock
    private val reportingRepository: ReportingRepository = mock()

    @Mock
    private val getAllUserVesselGroups: GetAllUserVesselGroups = mock()

    @Mock
    private val logbookReportRepository: LogbookReportRepository = mock()

    @Mock
    private val beaconRepository: BeaconRepository = mock()

    @Mock
    private val producerOrganizationMembershipRepository: ProducerOrganizationMembershipRepository = mock()

    @Mock
    private val vesselProfileRepository: VesselProfileRepository = mock()

    @Mock
    private val lastPositionRepository: LastPositionRepository = mock()

    @Mock
    private val riskFactorRepository: RiskFactorRepository = mock()

    private val getControlledVesselById =
        GetControlledVesselById(
            vesselRepository = vesselRepository,
            reportingRepository = reportingRepository,
            getAllUserVesselGroups = getAllUserVesselGroups,
            logbookReportRepository = logbookReportRepository,
            beaconRepository = beaconRepository,
            producerOrganizationMembershipRepository = producerOrganizationMembershipRepository,
            vesselProfileRepository = vesselProfileRepository,
            lastPositionRepository = lastPositionRepository,
            riskFactorRepository = riskFactorRepository,
        )

    private val dummyVessel =
        Vessel(
            id = 123,
            internalReferenceNumber = "DUMMY_CFR",
            flagState = CountryCode.FR,
            hasLogbookEsacapt = false,
        )

    private val dummyLastPosition =
        LastPosition(
            vesselId = 123,
            flagState = CountryCode.FR,
            positionType = PositionType.AIS,
            latitude = 16.445,
            longitude = 48.2525,
            dateTime = ZonedDateTime.now(),
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
        )

    private fun fixedGroup(
        id: Int,
        name: String,
        isPriorityGroup: Boolean,
        sharing: Sharing = Sharing.SHARED,
    ) = FixedVesselGroup(
        id = id,
        isDeleted = false,
        name = name,
        description = "",
        pointsOfAttention = "",
        color = "",
        sharing = sharing,
        isPriorityGroup = isPriorityGroup,
        createdBy = "dummy@email.gouv.fr",
        createdAtUtc = ZonedDateTime.now(),
        updatedAtUtc = null,
        endOfValidityUtc = null,
        vessels =
            listOf(
                VesselIdentity(
                    vesselId = 123,
                    cfr = "DUMMY_CFR",
                    name = "DUMMY VESSEL",
                    flagState = CountryCode.FR,
                    ircs = null,
                    externalIdentification = null,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ),
            ),
    )

    @Test
    fun `execute Should throw a NOT_FOUND exception When the vessel is not found`() {
        // Given
        given(vesselRepository.findVesselById(any())).willReturn(null)

        // When / Then
        assertThatThrownBy {
            runBlocking { getControlledVesselById.execute(vesselId = 123, userEmail = "user@gouv.fr") }
        }.isInstanceOf(BackendUsageException::class.java)
    }

    @Test
    fun `execute Should only keep the shared groups the vessel belongs to`() {
        // Given
        given(vesselRepository.findVesselById(any())).willReturn(dummyVessel)
        given(lastPositionRepository.findByVesselId(any())).willReturn(dummyLastPosition)
        given(getAllUserVesselGroups.execute(any())).willReturn(
            listOf(
                fixedGroup(id = 1, name = "Shared priority group", isPriorityGroup = true, sharing = Sharing.SHARED),
                fixedGroup(id = 2, name = "Shared group", isPriorityGroup = false, sharing = Sharing.SHARED),
                fixedGroup(id = 3, name = "Private group", isPriorityGroup = false, sharing = Sharing.PRIVATE),
            ),
        )

        // When
        val controlledVessel =
            runBlocking { getControlledVesselById.execute(vesselId = 123, userEmail = "user@gouv.fr") }

        // Then
        assertThat(controlledVessel.groups).hasSize(2)
        assertThat(controlledVessel.groups.map { it.name })
            .containsExactlyInAnyOrder("Shared priority group", "Shared group")
    }

    @Test
    fun `execute Should only keep the reportings opened during the current trip`() {
        // Given
        val lastDep = ZonedDateTime.now().minusDays(2)
        given(vesselRepository.findVesselById(any())).willReturn(dummyVessel)
        given(logbookReportRepository.findLastDepDatetimeOfCurrentTripsPerCfr(any())).willReturn(
            mapOf("DUMMY_CFR" to lastDep),
        )

        val infractionDuringTrip =
            infractionSuspicion(id = 1, creationDate = ZonedDateTime.now().minusDays(1))
        val infractionBeforeTrip =
            infractionSuspicion(id = 2, creationDate = ZonedDateTime.now().minusDays(3))
        val alertValidatedDuringTrip =
            alert(
                id = 3,
                creationDate = ZonedDateTime.now().minusDays(5),
                validationDate = ZonedDateTime.now().minusDays(1),
            )
        given(reportingRepository.findAll(any())).willReturn(
            listOf(infractionDuringTrip, infractionBeforeTrip, alertValidatedDuringTrip),
        )

        // When
        val controlledVessel =
            runBlocking { getControlledVesselById.execute(vesselId = 123, userEmail = "user@gouv.fr") }

        // Then
        assertThat(controlledVessel.tripReportings.map { it.id }).containsExactlyInAnyOrder(1, 3)
    }

    @Test
    fun `execute Should return no trip reportings When there is no current trip departure date`() {
        // Given
        given(vesselRepository.findVesselById(any())).willReturn(dummyVessel)
        given(logbookReportRepository.findLastDepDatetimeOfCurrentTripsPerCfr(any())).willReturn(emptyMap())
        given(reportingRepository.findAll(any())).willReturn(
            listOf(infractionSuspicion(id = 1, creationDate = ZonedDateTime.now())),
        )

        // When
        val controlledVessel =
            runBlocking { getControlledVesselById.execute(vesselId = 123, userEmail = "user@gouv.fr") }

        // Then
        assertThat(controlledVessel.tripReportings).isEmpty()
    }

    private fun infractionSuspicion(
        id: Int,
        creationDate: ZonedDateTime,
    ) = Reporting.InfractionSuspicion(
        id = id,
        vesselId = 123,
        cfr = "DUMMY_CFR",
        vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
        flagState = CountryCode.FR,
        creationDate = creationDate,
        reportingDate = creationDate,
        lastUpdateDate = creationDate,
        isArchived = false,
        isDeleted = false,
        reportingSource = ReportingSource.OPS,
        title = "Infraction suspicion",
        infractions =
            listOf(
                InfractionSuspicionThreat(
                    natinfCode = 123456,
                    threat = "threat",
                    threatCharacterization = "threat characterization",
                ),
            ),
        createdBy = "test@example.gouv.fr",
    )

    private fun alert(
        id: Int,
        creationDate: ZonedDateTime,
        validationDate: ZonedDateTime?,
    ) = Reporting.Alert(
        id = id,
        vesselId = 123,
        cfr = "DUMMY_CFR",
        vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
        flagState = CountryCode.FR,
        creationDate = creationDate,
        lastUpdateDate = creationDate,
        validationDate = validationDate,
        isArchived = false,
        isDeleted = false,
        createdBy = "test@example.gouv.fr",
        alertType = AlertType.POSITION_ALERT,
        alertId = 1,
        natinfCode = 7059,
        name = "Chalutage dans les 3 milles",
        threat = "Mesures techniques et de conservation",
        threatCharacterization = "Engin",
    )
}
