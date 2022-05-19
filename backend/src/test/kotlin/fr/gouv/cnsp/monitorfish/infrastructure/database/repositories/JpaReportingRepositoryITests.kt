package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

class JpaReportingRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaReportingRepository: JpaReportingRepository

    @Test
    @Transactional
    fun `save Should save a reporting from the pending alert`() {
        // Given
        val creationDate = ZonedDateTime.now()
        val now = ZonedDateTime.now()
        val alertOne = PendingAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                tripNumber = "123456",
                creationDate = creationDate,
                value = ThreeMilesTrawlingAlert("NAMO"))

        // When
        jpaReportingRepository.save(alertOne, now)
        val reporting = jpaReportingRepository.findAll()

        // Then
        assertThat(reporting).hasSize(1)
        assertThat(reporting.first().internalReferenceNumber).isEqualTo("FRFGRGR")
        assertThat(reporting.first().externalReferenceNumber).isEqualTo("RGD")
        val alert = reporting.first().value as ThreeMilesTrawlingAlert
        assertThat(alert.seaFront).isEqualTo("NAMO")
        assertThat(reporting.first().creationDate).isEqualTo(creationDate)
        assertThat(reporting.first().validationDate).isEqualTo(now)
    }
}
