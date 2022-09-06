package fr.gouv.cnsp.monitorfish.domain.entities.rules.type

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
internal class PNOAndLANWeightToleranceUTests {
  @Test
  fun `getPercentBetweenLANAndPNO Should return percent difference between PNO and LAN`() {
    // When LAN is 10% above than PNO
    val percent = PNOAndLANWeightTolerance(10.0, 50.0)
      .getPercentBetweenLANAndPNO(155.0, 100.0)

    assertThat(percent.toInt()).isEqualTo(35)
  }

  @Test
  fun `getPercentBetweenLANAndPNO Should return percent difference between LAN and PNO`() {
    // When PNO is 10% above than LAN
    val percent = PNOAndLANWeightTolerance(10.0, 50.0)
      .getPercentBetweenLANAndPNO(110.0, 180.0)

    assertThat(percent.toInt()).isEqualTo(63)
  }
}
