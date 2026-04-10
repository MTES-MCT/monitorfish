package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.CreateReportingDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.NatinfDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ThreatCharacterizationDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ThreatHierarchyDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateReportingDataInput
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZonedDateTime

@Import(SentryConfig::class, MapperConfiguration::class)
@WebMvcTest(value = [ReportingController::class])
class ReportingControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var archiveReporting: ArchiveReporting

    @MockitoBean
    private lateinit var deleteReporting: DeleteReporting

    @MockitoBean
    private lateinit var archiveReportings: ArchiveReportings

    @MockitoBean
    private lateinit var deleteReportings: DeleteReportings

    @MockitoBean
    private lateinit var addReporting: AddReporting

    @MockitoBean
    private lateinit var updateReporting: UpdateReporting

    @MockitoBean
    private lateinit var getAllCurrentReportings: GetAllCurrentReportings

    @MockitoBean
    private lateinit var getReportings: GetReportings

    @MockitoBean
    private lateinit var getReporting: GetReporting

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private fun authenticatedRequest() =
        oidcLogin()
            .idToken { token ->
                token.claim("email", "email@domain-name.com")
            }

    @Test
    fun `Should get a reporting by id`() {
        // Given
        val reporting =
            Reporting.InfractionSuspicion(
                id = 42,
                cfr = "FRFGRGR",
                externalMarker = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.OPS,
                natinfCode = 123456,
                title = "A title",
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
            )
        given(getReporting.execute(42)).willReturn(reporting)

        // When
        api
            .perform(
                get("/bff/v1/reportings/42")
                    .with(authenticatedRequest()),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.cfr", equalTo("FRFGRGR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.natinfCode", equalTo(123456)))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.title", equalTo("A title")))
    }

    @Test
    fun `Should archive a reporting`() {
        // When
        api
            .perform(
                put("/bff/v1/reportings/123/archive")
                    .with(authenticatedRequest())
                    .with(csrf()),
            )
            // Then
            .andExpect(status().isOk)

        Mockito.verify(archiveReporting).execute(123)
    }

    @Test
    fun `Should archive multiple reportings`() {
        // When
        api
            .perform(
                put("/bff/v1/reportings/archive")
                    .with(authenticatedRequest())
                    .with(csrf())
                    .content(objectMapper.writeValueAsString(listOf(1, 2, 3)))
                    .contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)

        Mockito.verify(archiveReportings).execute(listOf(1, 2, 3))
    }

    @Test
    fun `Should delete a reporting`() {
        // When
        api
            .perform(
                delete("/bff/v1/reportings/123")
                    .with(authenticatedRequest())
                    .with(csrf()),
            )
            // Then
            .andExpect(status().isOk)

        Mockito.verify(deleteReporting).execute(123)
    }

    @Test
    fun `Should delete multiple reportings`() {
        // When
        api
            .perform(
                delete("/bff/v1/reportings")
                    .with(authenticatedRequest())
                    .with(csrf())
                    .content(objectMapper.writeValueAsString(listOf(1, 2, 3)))
                    .contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)

        Mockito.verify(deleteReportings).execute(listOf(1, 2, 3))
    }

    @Test
    fun `Should create a reporting`() {
        // Given
        val reporting =
            Reporting.InfractionSuspicion(
                cfr = "FRFGRGR",
                externalMarker = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.OPS,
                natinfCode = 123456,
                title = "A title",
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
            )
        given(addReporting.execute(any())).willReturn(Pair(reporting, null))

        // When
        api
            .perform(
                post("/bff/v1/reportings")
                    .with(authenticatedRequest())
                    .with(csrf())
                    .content(
                        objectMapper.writeValueAsString(
                            CreateReportingDataInput(
                                cfr = "FRFGRGR",
                                externalMarker = "RGD",
                                ircs = "6554fEE",
                                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                                flagState = CountryCode.FR,
                                creationDate = ZonedDateTime.now(),
                                reportingDate = ZonedDateTime.now(),
                                type = ReportingType.INFRACTION_SUSPICION,
                                reportingSource = ReportingSource.OPS,
                                title = "A title",
                                threatHierarchy =
                                    ThreatHierarchyDataInput(
                                        value = "Obligations déclaratives",
                                        label = "Obligations déclaratives",
                                        children =
                                            listOf(
                                                ThreatCharacterizationDataInput(
                                                    value = "DEP",
                                                    label = "DEP",
                                                    children =
                                                        listOf(
                                                            NatinfDataInput(
                                                                value = 123456,
                                                                label = "123456",
                                                            ),
                                                        ),
                                                ),
                                            ),
                                    ),
                            ),
                        ),
                    ).contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isCreated)
            .andExpect(MockMvcResultMatchers.jsonPath("$.cfr", equalTo("FRFGRGR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.flagState", equalTo("FR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.reportingSource", equalTo("OPS")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.createdBy", equalTo("test")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.natinfCode", equalTo(123456)))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.title", equalTo("A title")))
    }

    @Test
    fun `Should create a reporting And return an augmented payload with the control unit object When a control unit id is given`() {
        // Given
        val reporting =
            Reporting.InfractionSuspicion(
                cfr = "FRFGRGR",
                externalMarker = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.UNIT,
                natinfCode = 123456,
                controlUnitId = 1234,
                title = "A title",
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
            )
        given(addReporting.execute(any())).willReturn(
            Pair(reporting, LegacyControlUnit(1234, "DIRM", false, "Cross Etel", listOf())),
        )

        // When
        api
            .perform(
                post("/bff/v1/reportings")
                    .with(authenticatedRequest())
                    .with(csrf())
                    .content(
                        objectMapper.writeValueAsString(
                            CreateReportingDataInput(
                                cfr = "FRFGRGR",
                                externalMarker = "RGD",
                                ircs = "6554fEE",
                                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                                flagState = CountryCode.FR,
                                creationDate = ZonedDateTime.now(),
                                reportingDate = ZonedDateTime.now(),
                                type = ReportingType.INFRACTION_SUSPICION,
                                reportingSource = ReportingSource.UNIT,
                                controlUnitId = 1234,
                                title = "A title",
                                threatHierarchy =
                                    ThreatHierarchyDataInput(
                                        value = "Obligations déclaratives",
                                        label = "Obligations déclaratives",
                                        children =
                                            listOf(
                                                ThreatCharacterizationDataInput(
                                                    value = "DEP",
                                                    label = "DEP",
                                                    children =
                                                        listOf(
                                                            NatinfDataInput(
                                                                value = 123456,
                                                                label = "123456",
                                                            ),
                                                        ),
                                                ),
                                            ),
                                    ),
                            ),
                        ),
                    ).contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isCreated)
            .andExpect(MockMvcResultMatchers.jsonPath("$.cfr", equalTo("FRFGRGR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.reportingSource", equalTo("UNIT")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.controlUnitId", equalTo(1234)))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.controlUnit.id", equalTo(1234)))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.controlUnit.name", equalTo("Cross Etel")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.natinfCode", equalTo(123456)))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.title", equalTo("A title")))
    }

    @Test
    fun `Should get all current reportings`() {
        // Given
        val reporting =
            Reporting.InfractionSuspicion(
                cfr = "FRFGRGR",
                externalMarker = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.OPS,
                natinfCode = 123456,
                title = "A title",
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                underCharter = true,
                createdBy = "test@example.gouv.fr",
            )
        given(getAllCurrentReportings.execute()).willReturn(
            listOf(Pair(reporting, null)),
        )

        // When
        api
            .perform(
                get("/bff/v1/reportings")
                    .with(authenticatedRequest())
                    .with(csrf()),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.length()", equalTo(1)))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].cfr", equalTo("FRFGRGR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].isArchived", equalTo(false)))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].isDeleted", equalTo(false)))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].underCharter", equalTo(true)))
    }

    @Test
    fun `Should update a reporting`() {
        // Given
        val reporting =
            Reporting.InfractionSuspicion(
                cfr = "FRFGRGR",
                externalMarker = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.OPS,
                natinfCode = 123456,
                title = "A title",
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                underCharter = true,
                createdBy = "test@example.gouv.fr",
            )
        given(updateReporting.execute(any(), any())).willReturn(Pair(reporting, null))

        // When
        api
            .perform(
                put("/bff/v1/reportings/123")
                    .content(
                        objectMapper.writeValueAsString(
                            UpdateReportingDataInput(
                                flagState = CountryCode.FR,
                                reportingSource = ReportingSource.OPS,
                                type = ReportingType.INFRACTION_SUSPICION,
                                reportingDate = ZonedDateTime.now(),
                                threatHierarchy =
                                    ThreatHierarchyDataInput(
                                        children =
                                            listOf(
                                                ThreatCharacterizationDataInput(
                                                    children =
                                                        listOf(
                                                            NatinfDataInput(
                                                                label = "27689",
                                                                value = 27689,
                                                            ),
                                                        ),
                                                    label = "Pêche sans autorisation par navire tiers",
                                                    value = "Pêche sans autorisation par navire tiers",
                                                ),
                                            ),
                                        label = "Activités INN",
                                        value = "Activités INN",
                                    ),
                                title = "A title",
                            ),
                        ),
                    ).contentType(MediaType.APPLICATION_JSON)
                    .with(authenticatedRequest())
                    .with(csrf()),
            )
            // Then
            .andExpect(status().isOk)

        Mockito.verify(updateReporting).execute(eq(123), any())
    }

    @Test
    fun `Should create a reporting When no vesselIdentifier given`() {
        // Given
        val reporting =
            Reporting.InfractionSuspicion(
                cfr = "FRFGRGR",
                externalMarker = "RGD",
                flagState = CountryCode.FR,
                ircs = "6554fEE",
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.OPS,
                natinfCode = 123456,
                title = "A title",
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
            )
        given(addReporting.execute(any())).willReturn(Pair(reporting, null))

        // When
        api
            .perform(
                post("/bff/v1/reportings")
                    .with(authenticatedRequest())
                    .with(csrf())
                    .content(
                        objectMapper.writeValueAsString(
                            CreateReportingDataInput(
                                cfr = "FRFGRGR",
                                externalMarker = "RGD",
                                flagState = CountryCode.FR,
                                ircs = "6554fEE",
                                creationDate = ZonedDateTime.now(),
                                reportingDate = ZonedDateTime.now(),
                                type = ReportingType.INFRACTION_SUSPICION,
                                reportingSource = ReportingSource.OPS,
                                title = "A title",
                                threatHierarchy =
                                    ThreatHierarchyDataInput(
                                        value = "Obligations déclaratives",
                                        label = "Obligations déclaratives",
                                        children =
                                            listOf(
                                                ThreatCharacterizationDataInput(
                                                    value = "DEP",
                                                    label = "DEP",
                                                    children =
                                                        listOf(
                                                            NatinfDataInput(
                                                                value = 123456,
                                                                label = "123456",
                                                            ),
                                                        ),
                                                ),
                                            ),
                                    ),
                            ),
                        ),
                    ).contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isCreated)
            .andExpect(MockMvcResultMatchers.jsonPath("$.cfr", equalTo("FRFGRGR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.reportingSource", equalTo("OPS")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.natinfCode", equalTo(123456)))
            .andExpect(MockMvcResultMatchers.jsonPath("$.value.title", equalTo("A title")))
    }

    @Test
    fun `Should search reportings`() {
        // Given
        val reporting =
            Reporting.InfractionSuspicion(
                cfr = "FRFGRGR",
                externalMarker = "RGD",
                ircs = "6554fEE",
                id = 1,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                isIUU = false,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.OPS,
                natinfCode = 27689,
                title = "Pêche IUU - Zone exclusive",
                threat = "Activités INN",
                threatCharacterization = "Pêche sans autorisation par navire tiers",
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                underCharter = false,
                createdBy = "test@example.gouv.fr",
                latitude = 6.3,
                longitude = -52.5,
            )
        given(
            getReportings.execute(
                isArchived = anyOrNull(),
                isIUU = anyOrNull(),
                reportingType = anyOrNull(),
                reportingPeriod = any(),
                startDate = anyOrNull(),
                endDate = anyOrNull(),
            ),
        ).willReturn(listOf(Pair(reporting, null)))

        // When
        api
            .perform(
                get("/bff/v1/reportings/display")
                    .param("reportingPeriod", "LAST_MONTH")
                    .with(authenticatedRequest()),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.length()", equalTo(1)))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].flagState", equalTo("FR")))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].isArchived", equalTo(false)))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].title", equalTo("Pêche IUU - Zone exclusive")))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].coordinates").exists())
    }
}
