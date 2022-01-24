package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.*
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@RunWith(SpringRunner::class)
class JpaBeaconStatusActionsRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaBeaconStatusActionsRepository: JpaBeaconStatusActionsRepository

    @Test
    @Transactional
    fun `findAllByBeaconStatusId Should return all actions for a given beacon status`() {
        // When
        val comments = jpaBeaconStatusActionsRepository.findAllByBeaconStatusId(1)

        assertThat(comments).hasSize(1)
        assertThat(comments.last().id).isEqualTo(4)
        assertThat(comments.last().beaconStatusId).isEqualTo(1)
        assertThat(comments.last().propertyName).isEqualTo(BeaconStatusActionPropertyName.VESSEL_STATUS)
        assertThat(comments.last().previousValue).isEqualTo("AT_PORT")
        assertThat(comments.last().nextValue).isEqualTo("TECHNICAL_STOP")
        assertThat(comments.last().dateTime).isNotNull
    }

    @Test
    @Transactional
    fun `save Should save an action for a given beacon status`() {
        // Given
        assertThat(jpaBeaconStatusActionsRepository.findAllByBeaconStatusId(1)).hasSize(1)

        // When
        val action = BeaconStatusAction(
                null,
                1,
                BeaconStatusActionPropertyName.STAGE,
                Stage.CROSS_CHECK.toString(),
                Stage.FOUR_HOUR_REPORT.toString(),
                ZonedDateTime.now())
        jpaBeaconStatusActionsRepository.save(action)

        // Then
        assertThat(jpaBeaconStatusActionsRepository.findAllByBeaconStatusId(1)).hasSize(2)
    }
}
