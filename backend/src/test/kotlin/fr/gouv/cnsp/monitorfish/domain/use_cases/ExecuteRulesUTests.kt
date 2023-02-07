package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.rules.Rule
import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.PNOAndLANWeightTolerance
import fr.gouv.cnsp.monitorfish.domain.repositories.RuleRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.ExecuteRules
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.rules.ExecutePnoAndLanWeightToleranceRule
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime
import java.util.*

@ExtendWith(SpringExtension::class)
class ExecuteRulesUTests {

    @MockBean
    private lateinit var rulesRepository: RuleRepository

    @MockBean
    private lateinit var executePNOAndLANWeightTolerance: ExecutePnoAndLanWeightToleranceRule

    @Test
    fun `execute Should call executePNOAndLANWeightTolerance When a PNOAndLANWeightTolerance rule is found`() {
        // Given
        val rule = Rule(
            UUID.randomUUID(),
            "Save an alert when PNO and LAN weights are below tolerance",
            true,
            ZonedDateTime.now(),
            null,
            null,
            null,
            PNOAndLANWeightTolerance(10.0),
        )
        given(rulesRepository.findAll()).willReturn(listOf(rule))

        // When
        ExecuteRules(rulesRepository, executePNOAndLANWeightTolerance).execute()

        // Then
        Mockito.verify(executePNOAndLANWeightTolerance).execute(eq(rule))
    }
}
