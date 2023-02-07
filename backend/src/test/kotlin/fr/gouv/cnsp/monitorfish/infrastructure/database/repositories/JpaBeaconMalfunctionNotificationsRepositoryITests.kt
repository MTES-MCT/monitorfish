package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.CommunicationMeans
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotificationRecipientFunction
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotificationType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional

@RunWith(SpringRunner::class)
class JpaBeaconMalfunctionNotificationsRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaBeaconMalfunctionNotificationsRepository: JpaBeaconMalfunctionNotificationsRepository

    @Test
    @Transactional
    fun `findAllByBeaconMalfunctionId Should return all actions for a given beacon malfunction`() {
        // When
        val notifications = jpaBeaconMalfunctionNotificationsRepository.findAllByBeaconMalfunctionId(2)

        assertThat(notifications).hasSize(9)
        assertThat(notifications.last().id).isEqualTo(9)
        assertThat(notifications.last().beaconMalfunctionId).isEqualTo(2)
        assertThat(notifications.last().dateTimeUtc).isNotNull
        assertThat(notifications.last().recipientFunction).isEqualTo(
            BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
        )
        assertThat(notifications.last().communicationMeans).isEqualTo(CommunicationMeans.SMS)
        assertThat(notifications.last().notificationType).isEqualTo(
            BeaconMalfunctionNotificationType.END_OF_MALFUNCTION,
        )
        assertThat(notifications.last().recipientName).isNull()
        assertThat(notifications.last().recipientAddressOrNumber).isEqualTo("0600000000")
        assertThat(notifications[7].success).isFalse
        assertThat(notifications[7].errorMessage).isEqualTo("The server didn't reply properly to the helo greeting.")
    }
}
