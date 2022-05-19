package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

class JpaSilencedAlertRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaSilencedAlertRepository: JpaSilencedAlertRepository

    @Test
    @Transactional
    fun `save Should save a silenced alert from the pending alert`() {
        // Given
        val now = ZonedDateTime.now()
        val alertOne = PendingAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                tripNumber = "123456",
                creationDate = ZonedDateTime.now(),
                value = ThreeMilesTrawlingAlert())

        // When
        jpaSilencedAlertRepository.save(alertOne, now, null)

        // Then
        val alerts = jpaSilencedAlertRepository.findAll()
        assertThat(alerts).hasSize(1)
        assertThat(alerts.first().internalReferenceNumber).isEqualTo("FRFGRGR")
        assertThat(alerts.first().externalReferenceNumber).isEqualTo("RGD")
        assertThat(alerts.first().alert).isEqualTo(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT)
        assertThat(alerts.first().silencedAfterDate).isNull()
        assertThat(alerts.first().silencedBeforeDate).isEqualTo(now)
    }
}
