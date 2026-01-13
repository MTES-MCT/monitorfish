package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class UpdateReportingDataInputUTests {
    @Test
    fun `toUpdatedReportingValues Should extract threat from threatHierarchy value`() {
        // Given
        val input =
            UpdateReportingDataInput(
                reportingActor = ReportingActor.OPS,
                type = ReportingType.INFRACTION_SUSPICION,
                authorTrigram = "LTH",
                title = "Test reporting",
                threatHierarchy =
                    ThreatHierarchyDataInput(
                        value = "Activités INN",
                        label = "Activités INN",
                        children =
                            listOf(
                                ThreatCharacterizationDataInput(
                                    value = "Pêche sans autorisation par navire tiers",
                                    label = "Pêche sans autorisation par navire tiers",
                                    children =
                                        listOf(
                                            NatinfDataInput(
                                                value = 2608,
                                                label = "2608",
                                            ),
                                        ),
                                ),
                            ),
                    ),
            )

        // When
        val result = input.toUpdatedReportingValues()

        // Then
        assertThat(result.threat).isEqualTo("Activités INN")
    }

    @Test
    fun `toUpdatedReportingValues Should extract threatCharacterization from nested children`() {
        // Given
        val input =
            UpdateReportingDataInput(
                reportingActor = ReportingActor.OPS,
                type = ReportingType.INFRACTION_SUSPICION,
                authorTrigram = "LTH",
                title = "Test reporting",
                threatHierarchy =
                    ThreatHierarchyDataInput(
                        value = "Activités INN",
                        label = "Activités INN",
                        children =
                            listOf(
                                ThreatCharacterizationDataInput(
                                    value = "Pêche sans autorisation par navire tiers",
                                    label = "Pêche sans autorisation par navire tiers",
                                    children =
                                        listOf(
                                            NatinfDataInput(
                                                value = 2608,
                                                label = "2608",
                                            ),
                                        ),
                                ),
                            ),
                    ),
            )

        // When
        val result = input.toUpdatedReportingValues()

        // Then
        assertThat(result.threatCharacterization).isEqualTo("Pêche sans autorisation par navire tiers")
    }

    @Test
    fun `toUpdatedReportingValues Should extract natinfCode from deeply nested children`() {
        // Given
        val input =
            UpdateReportingDataInput(
                reportingActor = ReportingActor.OPS,
                type = ReportingType.INFRACTION_SUSPICION,
                authorTrigram = "LTH",
                title = "Test reporting",
                threatHierarchy =
                    ThreatHierarchyDataInput(
                        value = "Activités INN",
                        label = "Activités INN",
                        children =
                            listOf(
                                ThreatCharacterizationDataInput(
                                    value = "Pêche sans autorisation par navire tiers",
                                    label = "Pêche sans autorisation par navire tiers",
                                    children =
                                        listOf(
                                            NatinfDataInput(
                                                value = 2608,
                                                label = "2608",
                                            ),
                                        ),
                                ),
                            ),
                    ),
            )

        // When
        val result = input.toUpdatedReportingValues()

        // Then
        assertThat(result.natinfCode).isEqualTo(2608)
    }

    @Test
    fun `toUpdatedReportingValues Should handle null threatHierarchy`() {
        // Given
        val input =
            UpdateReportingDataInput(
                reportingActor = ReportingActor.OPS,
                type = ReportingType.INFRACTION_SUSPICION,
                authorTrigram = "LTH",
                title = "Test reporting",
                threatHierarchy = null,
            )

        // When
        val result = input.toUpdatedReportingValues()

        // Then
        assertThat(result.threat).isNull()
        assertThat(result.threatCharacterization).isNull()
        assertThat(result.natinfCode).isNull()
    }

    @Test
    fun `toUpdatedReportingValues Should map all other fields correctly`() {
        // Given
        val expirationDate = ZonedDateTime.now().plusDays(30)
        val input =
            UpdateReportingDataInput(
                reportingActor = ReportingActor.UNIT,
                type = ReportingType.OBSERVATION,
                controlUnitId = 1234,
                authorTrigram = "ABC",
                authorContact = "abc@example.com",
                expirationDate = expirationDate,
                title = "Test title",
                description = "Test description",
                threatHierarchy =
                    ThreatHierarchyDataInput(
                        value = "Entrave au contrôle",
                        label = "Entrave au contrôle",
                        children =
                            listOf(
                                ThreatCharacterizationDataInput(
                                    value = "Dissimulation",
                                    label = "Dissimulation",
                                    children =
                                        listOf(
                                            NatinfDataInput(
                                                value = 12922,
                                                label = "12922",
                                            ),
                                        ),
                                ),
                            ),
                    ),
            )

        // When
        val result = input.toUpdatedReportingValues()

        // Then
        assertThat(result.reportingActor).isEqualTo(ReportingActor.UNIT)
        assertThat(result.type).isEqualTo(ReportingType.OBSERVATION)
        assertThat(result.controlUnitId).isEqualTo(1234)
        assertThat(result.authorTrigram).isEqualTo("ABC")
        assertThat(result.authorContact).isEqualTo("abc@example.com")
        assertThat(result.expirationDate).isEqualTo(expirationDate)
        assertThat(result.title).isEqualTo("Test title")
        assertThat(result.description).isEqualTo("Test description")
        assertThat(result.threat).isEqualTo("Entrave au contrôle")
        assertThat(result.threatCharacterization).isEqualTo("Dissimulation")
        assertThat(result.natinfCode).isEqualTo(12922)
    }
}
