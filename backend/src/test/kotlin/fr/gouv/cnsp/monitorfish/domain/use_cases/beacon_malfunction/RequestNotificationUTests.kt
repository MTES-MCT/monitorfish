package fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class RequestNotificationUTests {

    @MockBean
    private lateinit var beaconMalfunctionsRepository: BeaconMalfunctionsRepository

    @Test
    fun `execute Should throw an exception When notificationRequested is MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC and no foreignFmcCode is given`() {
        // When
        val throwable = catchThrowable {
            RequestNotification(
                beaconMalfunctionsRepository,
            )
                .execute(1, BeaconMalfunctionNotificationType.MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC, null)
        }

        // Then
        assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
        assertThat(throwable.message).contains(
            "requestedNotificationForeignFmcCode cannot be null when requesting a notification to a foreign FMC",
        )
    }

    @Test
    fun `execute Should call requestNotification with the right parameters When called with type MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC`() {
        // When
        RequestNotification(
            beaconMalfunctionsRepository,
        )
            .execute(1, BeaconMalfunctionNotificationType.MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC, "ABC")

        // Then
        Mockito.verify(beaconMalfunctionsRepository).requestNotification(
            1,
            BeaconMalfunctionNotificationType.MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC,
            "ABC",
        )
    }

    @Test
    fun `execute Should call requestNotification with the right parameters When called`() {
        // When
        RequestNotification(
            beaconMalfunctionsRepository,
        )
            .execute(
                2,
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION,
                "Should not be passed to repository",
            )

        // Then
        Mockito.verify(beaconMalfunctionsRepository).requestNotification(
            2,
            BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION,
            null,
        )
    }
}
