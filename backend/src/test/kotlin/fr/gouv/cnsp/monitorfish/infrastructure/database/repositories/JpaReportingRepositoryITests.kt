package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Import
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@Import(MapperConfiguration::class)
class JpaReportingRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaReportingRepository: JpaReportingRepository

    @Test
    @Transactional
    fun `save Should save a reporting from the pending alert`() {
        // Given
        val creationDate = ZonedDateTime.now()
        val now = ZonedDateTime.now()
        val positionAlertOne =
            PendingAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 125,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                tripNumber = "123456",
                creationDate = creationDate,
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        name = "Chalutage dans les 3 milles",
                        threat = "Obligations déclaratives",
                        threatCharacterization = "DEP",
                    ),
                latitude = 5.5588,
                longitude = -45.3698,
            )

        // When
        jpaReportingRepository.save(positionAlertOne, now)
        val reporting = jpaReportingRepository.findAll()

        // Then
        assertThat(reporting).hasSize(16)
        assertThat(reporting.last().internalReferenceNumber).isEqualTo("FRFGRGR")
        assertThat(reporting.last().externalReferenceNumber).isEqualTo("RGD")
        val positionAlert = reporting.last().value as Alert
        assertThat(positionAlert.seaFront).isEqualTo("NAMO")
        assertThat(reporting.last().creationDate).isEqualTo(creationDate)
        assertThat(reporting.last().validationDate).isEqualTo(now)
        assertThat(reporting.last().latitude).isEqualTo(5.5588)
        assertThat(reporting.last().longitude).isEqualTo(-45.3698)
        assertThat(reporting.last().vesselId).isEqualTo(125)
    }

    @Test
    @Transactional
    fun `save Should save a reporting`() {
        // Given
        val creationDate = ZonedDateTime.now()
        val reporting =
            Reporting(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 126,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = creationDate,
                value =
                    InfractionSuspicion(
                        ReportingActor.OPS,
                        natinfCode = 123456,
                        authorTrigram = "LTH",
                        title = "A title",
                        threat = "Obligations déclaratives",
                        threatCharacterization = "DEP",
                    ),
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
            )

        // When
        jpaReportingRepository.save(reporting)
        val reportings = jpaReportingRepository.findAll()

        // Then
        assertThat(reportings).hasSize(16)
        assertThat(reportings.last().internalReferenceNumber).isEqualTo("FRFGRGR")
        assertThat(reportings.last().externalReferenceNumber).isEqualTo("RGD")
        assertThat(reportings.last().type).isEqualTo(ReportingType.INFRACTION_SUSPICION)
        val infraction = reportings.last().value as InfractionSuspicion
        assertThat(infraction.reportingActor).isEqualTo(ReportingActor.OPS)
        assertThat(infraction.natinfCode).isEqualTo(123456)
        assertThat(infraction.title).isEqualTo("A title")
        assertThat(reportings.last().creationDate).isEqualTo(creationDate)
        assertThat(reportings.last().validationDate).isNull()
        assertThat(reportings.last().vesselId).isEqualTo(126)
    }

    @Test
    @Transactional
    fun `save Should save a reporting When no vessel identifier given`() {
        // Given
        val creationDate = ZonedDateTime.now()
        val reporting =
            Reporting(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 523,
                creationDate = creationDate,
                flagState = CountryCode.FR,
                value =
                    InfractionSuspicion(
                        ReportingActor.OPS,
                        natinfCode = 123456,
                        authorTrigram = "LTH",
                        title = "A title",
                        threat = "Obligations déclaratives",
                        threatCharacterization = "DEP",
                    ),
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
            )

        // When
        jpaReportingRepository.save(reporting)
        val reportings = jpaReportingRepository.findAll()

        // Then
        assertThat(reportings).hasSize(16)
        assertThat(reportings.last().internalReferenceNumber).isEqualTo("FRFGRGR")
        assertThat(reportings.last().externalReferenceNumber).isEqualTo("RGD")
        assertThat(reportings.last().type).isEqualTo(ReportingType.INFRACTION_SUSPICION)
        val infraction = reportings.last().value as InfractionSuspicion
        assertThat(infraction.reportingActor).isEqualTo(ReportingActor.OPS)
        assertThat(infraction.natinfCode).isEqualTo(123456)
        assertThat(infraction.title).isEqualTo("A title")
        assertThat(reportings.last().creationDate).isEqualTo(creationDate)
        assertThat(reportings.last().validationDate).isNull()
        assertThat(reportings.last().vesselId).isEqualTo(523)
    }

    @Test
    @Transactional
    fun `findCurrentAndArchivedByVesselIdentifierEquals Should return current and archived reporting`() {
        // When
        val reporting =
            jpaReportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                "ABC000180832",
                ZonedDateTime.now().minusYears(1),
            )

        // Then
        assertThat(reporting).hasSize(2)
        assertThat(reporting.last().internalReferenceNumber).isEqualTo("ABC000180832")
        assertThat(reporting.last().isArchived).isEqualTo(true)
        assertThat(reporting.last().isDeleted).isEqualTo(false)
        val positionAlertOne = reporting.last().value as Alert
        assertThat(positionAlertOne.seaFront).isEqualTo("NAMO")

        assertThat(reporting.first().internalReferenceNumber).isEqualTo("ABC000180832")
        assertThat(reporting.first().isArchived).isEqualTo(false)
        assertThat(reporting.first().isDeleted).isEqualTo(false)
        val positionAlertTwo = reporting.first().value as Alert
        assertThat(positionAlertTwo.seaFront).isEqualTo("NAMO")
    }

    @Test
    @Transactional
    fun `findCurrentAndArchivedByVesselIdentifierEquals Should return current and archived reporting When filtering with date`() {
        // When
        val reporting =
            jpaReportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                "ABC000180832",
                ZonedDateTime.now(),
            )

        // Then
        assertThat(reporting).hasSize(1)
        assertThat(reporting.first().internalReferenceNumber).isEqualTo("ABC000180832")
        assertThat(reporting.first().isArchived).isEqualTo(false)
        assertThat(reporting.first().isDeleted).isEqualTo(false)
        val positionAlertTwo = reporting.first().value as Alert
        assertThat(positionAlertTwo.seaFront).isEqualTo("NAMO")
    }

    @Test
    @Transactional
    fun `findCurrentAndArchivedByVesselIdEquals Should return current and archived reporting`() {
        // When
        val reporting =
            jpaReportingRepository.findCurrentAndArchivedByVesselIdEquals(
                123456,
                ZonedDateTime.now().minusYears(1),
            )

        // Then
        assertThat(reporting).hasSize(2)
        assertThat(reporting.last().internalReferenceNumber).isEqualTo("ABC000180832")
        assertThat(reporting.last().isArchived).isEqualTo(true)
        assertThat(reporting.last().isDeleted).isEqualTo(false)
        val positionAlertOne = reporting.last().value as Alert
        assertThat(positionAlertOne.seaFront).isEqualTo("NAMO")

        assertThat(reporting.first().internalReferenceNumber).isEqualTo("ABC000180832")
        assertThat(reporting.first().isArchived).isEqualTo(false)
        assertThat(reporting.first().isDeleted).isEqualTo(false)
        val positionAlertTwo = reporting.first().value as Alert
        assertThat(positionAlertTwo.seaFront).isEqualTo("NAMO")
    }

    @Test
    @Transactional
    fun `findCurrentInfractionSuspicionsByVesselId Should return current reportings`() {
        // When
        val reporting =
            jpaReportingRepository.findCurrentInfractionSuspicionsByVesselId(
                123456,
            )

        // Then
        assertThat(reporting).hasSize(1)

        assertThat(reporting.first().internalReferenceNumber).isEqualTo("ABC000180832")
        assertThat(reporting.first().isArchived).isEqualTo(false)
        assertThat(reporting.first().isDeleted).isEqualTo(false)
        val positionAlertTwo = reporting.first().value as Alert
        assertThat(positionAlertTwo.seaFront).isEqualTo("NAMO")
    }

    @Test
    @Transactional
    fun `archive Should set the archived flag as true`() {
        // Given
        val reportingToArchive =
            jpaReportingRepository
                .findCurrentAndArchivedByVesselIdentifierEquals(
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    "ABC000180832",
                    ZonedDateTime.now().minusYears(1),
                ).first()
        assertThat(reportingToArchive.id).isEqualTo(1)
        assertThat(reportingToArchive.isArchived).isEqualTo(false)
        assertThat(reportingToArchive.archivingDate).isNull()

        // When
        jpaReportingRepository.archive(1)

        // Then
        val archivedReporting =
            jpaReportingRepository
                .findCurrentAndArchivedByVesselIdentifierEquals(
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    "ABC000180832",
                    ZonedDateTime.now().minusYears(1),
                ).first { it.id == 1 }
        assertThat(archivedReporting.id).isEqualTo(1)
        assertThat(archivedReporting.isArchived).isEqualTo(true)
        assertThat(archivedReporting.archivingDate).isBefore(ZonedDateTime.now())
    }

    @Test
    @Transactional
    fun `delete Should set the deleted flag as true`() {
        // Given
        val reportingList =
            jpaReportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                "ABC000180832",
                ZonedDateTime.now().minusYears(1),
            )
        assertThat(reportingList).hasSize(2)

        // When
        jpaReportingRepository.delete(reportingList.first().id!!)

        // Then
        val nextReportingList =
            jpaReportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                "ABC000180832",
                ZonedDateTime.now().minusYears(1),
            )
        assertThat(nextReportingList).hasSize(1)
    }

    @Test
    @Transactional
    fun `findAll Should return non-archived reportings`() {
        val filter = ReportingFilter(isArchived = false)

        val result = jpaReportingRepository.findAll(filter)

        assertThat(result).hasSizeGreaterThan(0)
        assertThat(result.none { it.isArchived }).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `findAll Should return non-deleted reportings`() {
        val filter = ReportingFilter(isDeleted = false)

        val result = jpaReportingRepository.findAll(filter)

        assertThat(result).hasSizeGreaterThan(0)
        assertThat(result.none { it.isDeleted }).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `findAll Should return ALERT & INFRACTION_SUSPICION reportings`() {
        val filter = ReportingFilter(types = listOf(ReportingType.ALERT, ReportingType.INFRACTION_SUSPICION))

        val result = jpaReportingRepository.findAll(filter)

        assertThat(result).hasSizeGreaterThan(0)
        assertThat(
            result.all { listOf(ReportingType.ALERT, ReportingType.INFRACTION_SUSPICION).contains(it.type) },
        ).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `findAll Should return reportings for vessels MARIAGE ÎLE HASARD & COURANT MAIN PROFESSEUR`() {
        val filter = ReportingFilter(vesselInternalReferenceNumbers = listOf("ABC000180832", "ABC000042310"))

        val result = jpaReportingRepository.findAll(filter)

        assertThat(result).hasSizeGreaterThan(0)
        assertThat(
            result.all { listOf("ABC000180832", "ABC000042310").contains(it.internalReferenceNumber) },
        ).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `findAll Should return non-archived, non-deleted, ALERT & INFRACTION_SUSPICION reportings`() {
        val filter =
            ReportingFilter(
                isArchived = false,
                isDeleted = false,
                types = listOf(ReportingType.ALERT, ReportingType.INFRACTION_SUSPICION),
            )

        val result = jpaReportingRepository.findAll(filter)

        assertThat(result).hasSizeGreaterThan(0)
        assertThat(result.none { it.isArchived }).isEqualTo(true)
        assertThat(result.none { it.isDeleted }).isEqualTo(true)
        assertThat(
            result.all { listOf(ReportingType.ALERT, ReportingType.INFRACTION_SUSPICION).contains(it.type) },
        ).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `update Should update a given InfractionSuspicion`() {
        // Given
        val updatedReporting =
            InfractionSuspicion(
                reportingActor = ReportingActor.UNIT,
                controlUnitId = 1,
                authorTrigram = "",
                authorContact = "Jean Bon",
                title = "Une observation",
                description = "Une description",
                natinfCode = 1236,
                seaFront = "MEMN",
                dml = "DML 56",
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
            )

        // When
        val reporting = jpaReportingRepository.update(7, null, updatedReporting)

        // Then
        assertThat(reporting.internalReferenceNumber).isEqualTo("ABC000042310")
        assertThat((reporting.value as InfractionSuspicion).reportingActor).isEqualTo(updatedReporting.reportingActor)
        assertThat((reporting.value).controlUnitId).isEqualTo(updatedReporting.controlUnitId)
        assertThat((reporting.value).authorTrigram).isEqualTo(updatedReporting.authorTrigram)
        assertThat((reporting.value).authorContact).isEqualTo(updatedReporting.authorContact)
        assertThat((reporting.value).title).isEqualTo(updatedReporting.title)
        assertThat((reporting.value).description).isEqualTo(updatedReporting.description)
        assertThat((reporting.value).natinfCode).isEqualTo(updatedReporting.natinfCode)
        assertThat((reporting.value).seaFront).isEqualTo(updatedReporting.seaFront)
        assertThat((reporting.value).dml).isEqualTo(updatedReporting.dml)
    }

    @Test
    @Transactional
    fun `update Should update a given Observation`() {
        // Given
        val updatedExpirationDate = ZonedDateTime.now()
        val updatedReporting =
            Observation(
                ReportingActor.UNIT,
                1,
                "",
                "Jean Bon",
                "Une observation",
                "Une description",
            )

        // When
        val reporting = jpaReportingRepository.update(8, updatedExpirationDate, updatedReporting)

        // Then
        assertThat(reporting.internalReferenceNumber).isEqualTo("ABC000597493")
        assertThat((reporting.value as Observation).reportingActor).isEqualTo(updatedReporting.reportingActor)
        assertThat((reporting.value).controlUnitId).isEqualTo(updatedReporting.controlUnitId)
        assertThat((reporting.value).authorTrigram).isEqualTo(updatedReporting.authorTrigram)
        assertThat((reporting.value).authorContact).isEqualTo(updatedReporting.authorContact)
        assertThat((reporting.value).title).isEqualTo(updatedReporting.title)
        assertThat((reporting.value).description).isEqualTo(updatedReporting.description)
    }

    @Test
    @Transactional
    fun `update Should convert an InfractionSuspicion to an Observation`() {
        // Given
        val updatedReporting =
            Observation(
                ReportingActor.UNIT,
                1,
                "",
                "Jean Bon",
                "Une observation",
                "Une description",
            )

        // When
        val reporting = jpaReportingRepository.update(7, null, updatedReporting)

        // Then
        assertThat(reporting.internalReferenceNumber).isEqualTo("ABC000042310")
        assertThat(reporting.type).isEqualTo(ReportingType.OBSERVATION)
        assertThat((reporting.value as Observation).reportingActor).isEqualTo(updatedReporting.reportingActor)
        assertThat((reporting.value).controlUnitId).isEqualTo(updatedReporting.controlUnitId)
        assertThat((reporting.value).authorTrigram).isEqualTo(updatedReporting.authorTrigram)
        assertThat((reporting.value).authorContact).isEqualTo(updatedReporting.authorContact)
        assertThat((reporting.value).title).isEqualTo(updatedReporting.title)
        assertThat((reporting.value).description).isEqualTo(updatedReporting.description)
    }

    @Test
    @Transactional
    fun `findUnarchivedReportings Should return archive candidates`() {
        // When
        val reportings = jpaReportingRepository.findUnarchivedReportingsAfterNewVoyage()

        // Then
        assertThat(reportings).hasSize(1)
        assertThat(reportings.first().first).isEqualTo(1)
        assertThat(reportings.first().second.type).isEqualTo(AlertType.POSITION_ALERT)
    }

    @Test
    @Transactional
    fun `findExpiredReportings Should return expired reportings, hence archive candidates`() {
        // When
        val reportings = jpaReportingRepository.findExpiredReportings()

        // Then
        assertThat(reportings).hasSize(1)
        assertThat(reportings.first()).isEqualTo(12)
    }

    @Test
    @Transactional
    fun `archiveReportings Should archive reportings`() {
        // When
        val archivedReportings = jpaReportingRepository.archiveReportings(listOf(1))

        // Then
        assertThat(archivedReportings).isEqualTo(1)
    }
}
