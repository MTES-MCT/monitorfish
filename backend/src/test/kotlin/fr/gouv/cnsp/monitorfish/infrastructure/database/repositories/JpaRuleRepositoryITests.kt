package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.PNOAndLANWeightTolerance
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaRuleRepositoryITests : AbstractDBTests() {

  @Autowired
  private lateinit var jpaRuleRepository: JpaRuleRepository

  @Test
  @Transactional
  fun `findAll Should return all rules`() {
    // When
    val rules = jpaRuleRepository.findAll()

    // Then
    assertThat(rules).hasSize(1)
    assertThat(rules.first().title).isEqualTo("Save an alert when PNO and LAN weights are below tolerance")
    assertThat(rules.first().value).isInstanceOf(PNOAndLANWeightTolerance::class.java)

    val ruleType = rules.first().value as PNOAndLANWeightTolerance
    assertThat(ruleType.percentOfTolerance).isEqualTo(10.0)
  }

}
