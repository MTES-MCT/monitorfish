package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@RunWith(SpringRunner::class)
class JpaBeaconMalfunctionActionsRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaBeaconMalfunctionActionsRepository: JpaBeaconMalfunctionActionsRepository

    @Test
    @Transactional
    fun `findAllByBeaconMalfunctionId Should return all actions for a given beacon malfunction`() {
        // When
        val comments = jpaBeaconMalfunctionActionsRepository.findAllByBeaconMalfunctionId(1)

        assertThat(comments).hasSize(1)
        assertThat(comments.last().id).isEqualTo(4)
        assertThat(comments.last().beaconMalfunctionId).isEqualTo(1)
        assertThat(comments.last().propertyName).isEqualTo(BeaconMalfunctionActionPropertyName.VESSEL_STATUS)
        assertThat(comments.last().previousValue).isEqualTo("AT_PORT")
        assertThat(comments.last().nextValue).isEqualTo("TECHNICAL_STOP")
        assertThat(comments.last().dateTime).isNotNull
    }

    @Test
    @Transactional
    fun `save Should save an action for a given beacon malfunction`() {
        // Given
        assertThat(jpaBeaconMalfunctionActionsRepository.findAllByBeaconMalfunctionId(1)).hasSize(1)

        // When
        val action = BeaconMalfunctionAction(
                null,
                1,
                BeaconMalfunctionActionPropertyName.STAGE,
                Stage.CROSS_CHECK.toString(),
                Stage.FOUR_HOUR_REPORT.toString(),
                ZonedDateTime.now())
        jpaBeaconMalfunctionActionsRepository.save(action)

        // Then
        assertThat(jpaBeaconMalfunctionActionsRepository.findAllByBeaconMalfunctionId(1)).hasSize(2)
    }
}
