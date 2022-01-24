package fr.gouv.cnsp.monitorfish.domain.use_cases.rules

import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.PNOAndLANWeightToleranceAlert
import fr.gouv.cnsp.monitorfish.domain.entities.rules.Rule
import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.PNOAndLANWeightTolerance
import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.RuleTypeMapping
import fr.gouv.cnsp.monitorfish.domain.repositories.AlertRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ERSRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RuleRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getDummyPNOAndLANERSMessages
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime
import java.util.*

@ExtendWith(SpringExtension::class)
class ExecutePnoAndLanWeightToleranceRuleUTests {

    @MockBean
    private lateinit var ersRepository: ERSRepository

    @MockBean
    private lateinit var rulesRepository: RuleRepository

    @MockBean
    private lateinit var alertRepository: AlertRepository

    @Test
    fun `execute Should not save any alert When LAN and PNO weights are below the tolerance threshold or the minimum weight threshold`() {
        // Given
        val rule = Rule(UUID.randomUUID(),
                "Save an alert when PNO and LAN weights are below tolerance",
                true,
                ZonedDateTime.now(),
                null,
                null,
                null,
                PNOAndLANWeightTolerance(10.0, 50.0)
        )
        given(ersRepository.findLANAndPNOMessagesNotAnalyzedBy(RuleTypeMapping.PNO_LAN_WEIGHT_TOLERANCE.name))
                .willReturn(getDummyPNOAndLANERSMessages())

        // When
        ExecutePnoAndLanWeightToleranceRule(ersRepository, alertRepository).execute(rule)

        // Then
        Mockito.verify(alertRepository, never()).save(any())
    }

    @Test
    fun `execute Should save an alert When LAN and PNO weights are above the tolerance threshold`() {
        // Given
        val rule = Rule(UUID.randomUUID(),
                "Save an alert when PNO and LAN weights are below tolerance",
                true,
                ZonedDateTime.now(),
                null,
                null,
                null,
                PNOAndLANWeightTolerance(10.0, 50.0)
        )
        given(ersRepository.findLANAndPNOMessagesNotAnalyzedBy(RuleTypeMapping.PNO_LAN_WEIGHT_TOLERANCE.name))
                .willReturn(getDummyPNOAndLANERSMessages(1000.0, true))

        // When
        ExecutePnoAndLanWeightToleranceRule(ersRepository, alertRepository).execute(rule)

        // Then
        argumentCaptor<Alert>().apply {
            verify(alertRepository, times(2)).save(capture())

            assertThat(allValues).hasSize(2)

            assertThat(allValues.first().value.type).isEqualTo(AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT)
            assertThat((allValues.first().value as PNOAndLANWeightToleranceAlert).lanOperationNumber).isEqualTo("456846844658")
            assertThat((allValues.first().value as PNOAndLANWeightToleranceAlert).pnoOperationNumber).isEqualTo("47177857577")
            assertThat((allValues.first().value as PNOAndLANWeightToleranceAlert).percentOfTolerance).isEqualTo(10.0)
            assertThat((allValues.first().value as PNOAndLANWeightToleranceAlert).minimumWeightThreshold).isEqualTo(50.0)
            assertThat((allValues.first().value as PNOAndLANWeightToleranceAlert).catchesOverTolerance).hasSize(2)
            val firstCatchAlerts = (allValues.first().value as PNOAndLANWeightToleranceAlert).catchesOverTolerance
            assertThat(firstCatchAlerts?.first()?.lan?.weight).isEqualTo(123.0)
            assertThat(firstCatchAlerts?.first()?.pno?.weight).isEqualTo(1123.0)
            assertThat(firstCatchAlerts?.last()?.lan?.weight).isEqualTo(69.7)
            assertThat(firstCatchAlerts?.last()?.pno?.weight).isEqualTo(1069.7)

            assertThat(allValues.last().value.type).isEqualTo(AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT)
            assertThat((allValues.last().value as PNOAndLANWeightToleranceAlert).lanOperationNumber).isEqualTo("48545254254")
            assertThat((allValues.last().value as PNOAndLANWeightToleranceAlert).pnoOperationNumber).isEqualTo("004045204504")
            assertThat((allValues.last().value as PNOAndLANWeightToleranceAlert).percentOfTolerance).isEqualTo(10.0)
            assertThat((allValues.last().value as PNOAndLANWeightToleranceAlert).minimumWeightThreshold).isEqualTo(50.0)
            assertThat((allValues.last().value as PNOAndLANWeightToleranceAlert).catchesOverTolerance).hasSize(1)
            val secondCatchAlerts = (allValues.last().value as PNOAndLANWeightToleranceAlert).catchesOverTolerance
            assertThat(secondCatchAlerts?.first()?.lan?.weight).isEqualTo(2225.0)
            assertThat(secondCatchAlerts?.first()?.pno?.weight).isNull()
        }
    }

    @Test
    fun `execute Should update the ers messages When they are processed`() {
        // Given
        val rule = Rule(UUID.randomUUID(),
                "Save an alert when PNO and LAN weights are below tolerance",
                true,
                ZonedDateTime.now(),
                null,
                null,
                null,
                PNOAndLANWeightTolerance(10.0, 50.0)
        )
        given(ersRepository.findLANAndPNOMessagesNotAnalyzedBy(RuleTypeMapping.PNO_LAN_WEIGHT_TOLERANCE.name))
                .willReturn(getDummyPNOAndLANERSMessages(1000.0))

        // When
        ExecutePnoAndLanWeightToleranceRule(ersRepository, alertRepository).execute(rule)

        // Then
        argumentCaptor<Alert>().apply {
            verify(ersRepository, times(1))
                    .updateERSMessagesAsProcessedByRule(listOf(1, 2, 3, 4), "PNO_LAN_WEIGHT_TOLERANCE")
        }
    }
}
