package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class UpdateReportingDataInputUTests {
    private fun makeThreatHierarchy(
        threat: String = "Activités INN",
        threatCharacterization: String = "Pêche sans autorisation par navire tiers",
        natinfCode: Int = 2608,
    ) = ThreatHierarchyDataInput(
        value = threat,
        label = threat,
        children =
            listOf(
                ThreatCharacterizationDataInput(
                    value = threatCharacterization,
                    label = threatCharacterization,
                    children =
                        listOf(
                            NatinfDataInput(
                                value = natinfCode,
                                label = natinfCode.toString(),
                            ),
                        ),
                ),
            ),
    )

    @Test
    fun `toUpdatedReportingValues Should extract threat from threatHierarchies`() {
        val input =
            UpdateReportingDataInput(
                flagState = CountryCode.FR,
                reportingSource = ReportingSource.OPS,
                type = ReportingType.INFRACTION_SUSPICION,
                reportingDate = ZonedDateTime.now(),
                title = "Test reporting",
                threatHierarchies = listOf(makeThreatHierarchy()),
            )

        val result = input.toUpdatedReportingValues()

        assertThat(result.infractions).hasSize(1)
        assertThat(result.infractions[0].threat).isEqualTo("Activités INN")
    }

    @Test
    fun `toUpdatedReportingValues Should extract threatCharacterization from nested children`() {
        val input =
            UpdateReportingDataInput(
                flagState = CountryCode.FR,
                reportingSource = ReportingSource.OPS,
                type = ReportingType.INFRACTION_SUSPICION,
                reportingDate = ZonedDateTime.now(),
                title = "Test reporting",
                threatHierarchies = listOf(makeThreatHierarchy()),
            )

        val result = input.toUpdatedReportingValues()

        assertThat(result.infractions[0].threatCharacterization).isEqualTo("Pêche sans autorisation par navire tiers")
    }

    @Test
    fun `toUpdatedReportingValues Should extract natinfCode from deeply nested children`() {
        val input =
            UpdateReportingDataInput(
                flagState = CountryCode.FR,
                reportingSource = ReportingSource.OPS,
                type = ReportingType.INFRACTION_SUSPICION,
                reportingDate = ZonedDateTime.now(),
                title = "Test reporting",
                threatHierarchies = listOf(makeThreatHierarchy()),
            )

        val result = input.toUpdatedReportingValues()

        assertThat(result.infractions[0].natinfCode).isEqualTo(2608)
    }

    @Test
    fun `toUpdatedReportingValues Should handle empty threatHierarchies`() {
        val input =
            UpdateReportingDataInput(
                flagState = CountryCode.FR,
                reportingSource = ReportingSource.OPS,
                type = ReportingType.INFRACTION_SUSPICION,
                reportingDate = ZonedDateTime.now(),
                title = "Test reporting",
                threatHierarchies = emptyList(),
            )

        val result = input.toUpdatedReportingValues()

        assertThat(result.infractions).isEmpty()
    }

    @Test
    fun `toUpdatedReportingValues Should handle multiple threatHierarchies`() {
        val input =
            UpdateReportingDataInput(
                flagState = CountryCode.FR,
                reportingSource = ReportingSource.OPS,
                type = ReportingType.INFRACTION_SUSPICION,
                reportingDate = ZonedDateTime.now(),
                title = "Test reporting",
                threatHierarchies =
                    listOf(
                        makeThreatHierarchy(
                            threat = "Activités INN",
                            threatCharacterization = "Pêche sans autorisation par navire tiers",
                            natinfCode = 2608,
                        ),
                        makeThreatHierarchy(
                            threat = "Entrave au contrôle",
                            threatCharacterization = "Dissimulation",
                            natinfCode = 12922,
                        ),
                    ),
            )

        val result = input.toUpdatedReportingValues()

        assertThat(result.infractions).hasSize(2)
        assertThat(result.infractions[0].natinfCode).isEqualTo(2608)
        assertThat(result.infractions[1].natinfCode).isEqualTo(12922)
    }

    @Test
    fun `toUpdatedReportingValues Should map all other fields correctly`() {
        val expirationDate = ZonedDateTime.now().plusDays(30)
        val input =
            UpdateReportingDataInput(
                flagState = CountryCode.FR,
                reportingSource = ReportingSource.UNIT,
                type = ReportingType.OBSERVATION,
                reportingDate = ZonedDateTime.now(),
                controlUnitId = 1234,
                authorContact = "abc@example.com",
                expirationDate = expirationDate,
                numberOfVessels = 2,
                title = "Test title",
                description = "Test description",
                threatHierarchies =
                    listOf(
                        makeThreatHierarchy(
                            threat = "Entrave au contrôle",
                            threatCharacterization = "Dissimulation",
                            natinfCode = 12922,
                        ),
                    ),
            )

        val result = input.toUpdatedReportingValues()

        assertThat(result.reportingSource).isEqualTo(ReportingSource.UNIT)
        assertThat(result.type).isEqualTo(ReportingType.OBSERVATION)
        assertThat(result.controlUnitId).isEqualTo(1234)
        assertThat(result.authorContact).isEqualTo("abc@example.com")
        assertThat(result.expirationDate).isEqualTo(expirationDate)
        assertThat(result.numberOfVessels).isEqualTo(2)
        assertThat(result.title).isEqualTo("Test title")
        assertThat(result.description).isEqualTo("Test description")
        assertThat(result.infractions[0].threat).isEqualTo("Entrave au contrôle")
        assertThat(result.infractions[0].threatCharacterization).isEqualTo("Dissimulation")
        assertThat(result.infractions[0].natinfCode).isEqualTo(12922)
    }
}
