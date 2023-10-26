package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.CommunicationMeans
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotificationRecipientFunction
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotificationType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaBeaconMalfunctionNotificationsRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaBeaconMalfunctionNotificationsRepository: JpaBeaconMalfunctionNotificationsRepository

    @Test
    @Transactional
    fun `findAllByBeaconMalfunctionId Should return all notifications for a given beacon malfunction`() {
        // When
        val notifications = jpaBeaconMalfunctionNotificationsRepository.findAllByBeaconMalfunctionId(2)

        assertThat(notifications).hasSize(10)
        assertThat(notifications.last().id).isEqualTo(10)
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
        assertThat(notifications[8].success).isFalse
        assertThat(notifications[8].errorMessage).isEqualTo("The server didn't reply properly to the helo greeting.")
    }
}
