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
        assertThat(reporting).hasSize(5)
        assertThat(reporting.last().internalReferenceNumber).isEqualTo("FRFGRGR")
        assertThat(reporting.last().externalReferenceNumber).isEqualTo("RGD")
        val alert = reporting.last().value as ThreeMilesTrawlingAlert
        assertThat(alert.seaFront).isEqualTo("NAMO")
        assertThat(reporting.last().creationDate).isEqualTo(creationDate)
        assertThat(reporting.last().validationDate).isEqualTo(now)
    }

    @Test
    @Transactional
    fun `findCurrentAndArchivedByVesselIdentifierEquals Should return current and archived reporting`() {
        // When
        val reporting = jpaReportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "ABC000180832", ZonedDateTime.now().minusYears(1))

        // Then
        assertThat(reporting).hasSize(2)
        assertThat(reporting.last().internalReferenceNumber).isEqualTo("ABC000180832")
        assertThat(reporting.last().isArchived).isEqualTo(true)
        assertThat(reporting.last().isDeleted).isEqualTo(false)
        val alertOne = reporting.last().value as ThreeMilesTrawlingAlert
        assertThat(alertOne.seaFront).isEqualTo("NAMO")

        assertThat(reporting.first().internalReferenceNumber).isEqualTo("ABC000180832")
        assertThat(reporting.first().isArchived).isEqualTo(false)
        assertThat(reporting.first().isDeleted).isEqualTo(false)
        val alertTwo = reporting.first().value as ThreeMilesTrawlingAlert
        assertThat(alertTwo.seaFront).isEqualTo("NAMO")
    }

    @Test
    @Transactional
    fun `findCurrentAndArchivedByVesselIdentifierEquals Should return current and archived reporting When filtering with date`() {
        // When
        val reporting = jpaReportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER, "ABC000180832", ZonedDateTime.now())

        // Then
        assertThat(reporting).hasSize(1)
        assertThat(reporting.first().internalReferenceNumber).isEqualTo("ABC000180832")
        assertThat(reporting.first().isArchived).isEqualTo(false)
        assertThat(reporting.first().isDeleted).isEqualTo(false)
        val alertTwo = reporting.first().value as ThreeMilesTrawlingAlert
        assertThat(alertTwo.seaFront).isEqualTo("NAMO")
    }
}
