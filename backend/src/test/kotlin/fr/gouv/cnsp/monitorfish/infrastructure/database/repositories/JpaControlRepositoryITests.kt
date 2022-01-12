package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@RunWith(SpringRunner::class)
class JpaControlRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaControlRepository: JpaControlRepository

    @Test
    @Transactional
    fun `findVesselControlsAfterDateTime Should return all vessel's controls after a date time`() {
        // Given
        val dateTime = ZonedDateTime.now().minusMonths(1)

        // When
        val controls = jpaControlRepository.findVesselControlsAfterDateTime(1, dateTime)

        // Then
        assertThat(controls).hasSize(1)
        assertThat(controls.first().control.cnspCalledUnit).isEqualTo(false)
        assertThat(controls.first().control.controller.administration).isEqualTo("Affaires Maritimes")
        assertThat(controls.first().control.controller.controller).isEqualTo("ULAM 56")
        assertThat(controls.first().control.controller.controllerType).isEqualTo("Terrestre")
        assertThat(controls.first().infractionIds).hasSize(2)
        assertThat(controls.first().control.gearControls).hasSize(2)
        assertThat(controls.first().control.gearControls.first().gearCode).isEqualTo("OTB")
        assertThat(controls.first().control.gearControls.first().gearWasControlled).isFalse
        assertThat(controls.first().control.gearControls.first().controlledMesh).isNull()
        assertThat(controls.first().control.gearControls.first().declaredMesh).isEqualTo(60.0)
    }

    @Test
    @Transactional
    fun `findVesselControlsAfterDateTime Should return no vessel controls before a date time`() {
        // Given
        val dateTime = ZonedDateTime.now().plusYears(2)

        // When
        val controls = jpaControlRepository.findVesselControlsAfterDateTime(1, dateTime)

        // Then
        assertThat(controls).hasSize(0)
    }

}
