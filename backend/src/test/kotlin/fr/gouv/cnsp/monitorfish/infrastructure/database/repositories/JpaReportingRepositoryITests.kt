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
                        threat = "Obligations déclaratives",
                        threatCharacterization = "DEP",
                        name = "Chalutage dans les 3 milles",
                    ),
                latitude = 5.5588,
                longitude = -45.3698,
            )

        // When
        jpaReportingRepository.save(positionAlertOne, now)
        val reporting = jpaReportingRepository.findAll()

        // Then
        assertThat(reporting).hasSize(816)
        assertThat(reporting.last().cfr).isEqualTo("FRFGRGR")
        assertThat(reporting.last().externalMarker).isEqualTo("RGD")
        val positionAlert = reporting.last() as Reporting.Alert
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
            Reporting.InfractionSuspicion(
                cfr = "FRFGRGR",
                externalMarker = "RGD",
                ircs = "6554fEE",
                vesselId = 126,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = creationDate,
                lastUpdateDate = creationDate,
                reportingSource = ReportingSource.OPS,
                natinfCode = 123456,
                title = "A title",
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
            )

        // When
        jpaReportingRepository.save(reporting)
        val reportings = jpaReportingRepository.findAll()

        // Then
        assertThat(reportings).hasSize(816)
        assertThat(reportings.last().cfr).isEqualTo("FRFGRGR")
        assertThat(reportings.last().externalMarker).isEqualTo("RGD")
        assertThat(reportings.last().type).isEqualTo(ReportingType.INFRACTION_SUSPICION)
        val infraction = reportings.last() as Reporting.InfractionSuspicion
        assertThat(infraction.reportingSource).isEqualTo(ReportingSource.OPS)
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
            Reporting.InfractionSuspicion(
                cfr = "FRFGRGR",
                externalMarker = "RGD",
                ircs = "6554fEE",
                vesselId = 523,
                creationDate = creationDate,
                lastUpdateDate = creationDate,
                flagState = CountryCode.FR,
                reportingSource = ReportingSource.OPS,
                natinfCode = 123456,
                title = "A title",
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
            )

        // When
        jpaReportingRepository.save(reporting)
        val reportings = jpaReportingRepository.findAll()

        // Then
        assertThat(reportings).hasSize(816)
        assertThat(reportings.last().cfr).isEqualTo("FRFGRGR")
        assertThat(reportings.last().externalMarker).isEqualTo("RGD")
        assertThat(reportings.last().type).isEqualTo(ReportingType.INFRACTION_SUSPICION)
        val infraction = reportings.last() as Reporting.InfractionSuspicion
        assertThat(infraction.reportingSource).isEqualTo(ReportingSource.OPS)
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
        assertThat(reporting.last().cfr).isEqualTo("ABC000180832")
        assertThat(reporting.last().isArchived).isEqualTo(true)
        assertThat(reporting.last().isDeleted).isEqualTo(false)
        val positionAlertOne = reporting.last() as Reporting.Alert
        assertThat(positionAlertOne.seaFront).isEqualTo("NAMO")

        assertThat(reporting.first().cfr).isEqualTo("ABC000180832")
        assertThat(reporting.first().isArchived).isEqualTo(false)
        assertThat(reporting.first().isDeleted).isEqualTo(false)
        val positionAlertTwo = reporting.first() as Reporting.Alert
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
        assertThat(reporting.first().cfr).isEqualTo("ABC000180832")
        assertThat(reporting.first().isArchived).isEqualTo(false)
        assertThat(reporting.first().isDeleted).isEqualTo(false)
        val positionAlertTwo = reporting.first() as Reporting.Alert
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
        assertThat(reporting.last().cfr).isEqualTo("ABC000180832")
        assertThat(reporting.last().isArchived).isEqualTo(true)
        assertThat(reporting.last().isDeleted).isEqualTo(false)
        val positionAlertOne = reporting.last() as Reporting.Alert
        assertThat(positionAlertOne.seaFront).isEqualTo("NAMO")

        assertThat(reporting.first().cfr).isEqualTo("ABC000180832")
        assertThat(reporting.first().isArchived).isEqualTo(false)
        assertThat(reporting.first().isDeleted).isEqualTo(false)
        val positionAlertTwo = reporting.first() as Reporting.Alert
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

        assertThat(reporting.first().cfr).isEqualTo("ABC000180832")
        assertThat(reporting.first().isArchived).isEqualTo(false)
        assertThat(reporting.first().isDeleted).isEqualTo(false)
        val positionAlertTwo = reporting.first() as Reporting.Alert
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
            result.all { listOf("ABC000180832", "ABC000042310").contains(it.cfr) },
        ).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `findAll Should return reportings for given vessel ids`() {
        val filter = ReportingFilter(vesselIds = listOf(123456))

        val result = jpaReportingRepository.findAll(filter)

        assertThat(result).hasSizeGreaterThan(0)
        assertThat(result.all { it.vesselId == 123456 }).isEqualTo(true)
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
            Reporting.InfractionSuspicion(
                cfr = "FRFGRGR",
                externalMarker = "RGD",
                ircs = "6554fEE",
                vesselId = 523,
                creationDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                flagState = CountryCode.FR,
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
                reportingSource = ReportingSource.UNIT,
                controlUnitId = 1,
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
        val reporting = jpaReportingRepository.update(reportingId = 7, updatedReporting)

        // Then
        assertThat(reporting.cfr).isEqualTo("ABC000042310")
        assertThat(
            (reporting as Reporting.InfractionSuspicion).reportingSource,
        ).isEqualTo(updatedReporting.reportingSource)
        assertThat((reporting).controlUnitId).isEqualTo(updatedReporting.controlUnitId)
        assertThat((reporting).authorContact).isEqualTo(updatedReporting.authorContact)
        assertThat((reporting).title).isEqualTo(updatedReporting.title)
        assertThat((reporting).description).isEqualTo(updatedReporting.description)
        assertThat((reporting).natinfCode).isEqualTo(updatedReporting.natinfCode)
        assertThat((reporting).seaFront).isEqualTo(updatedReporting.seaFront)
        assertThat((reporting).dml).isEqualTo(updatedReporting.dml)
    }

    @Test
    @Transactional
    fun `update Should update a given Observation`() {
        // Given
        val updatedExpirationDate = ZonedDateTime.now()
        val updatedReporting =
            Reporting.Observation(
                cfr = "FRFGRGR",
                externalMarker = "RGD",
                ircs = "6554fEE",
                vesselId = 523,
                creationDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                expirationDate = updatedExpirationDate,
                flagState = CountryCode.FR,
                type = ReportingType.OBSERVATION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
                reportingSource = ReportingSource.UNIT,
                controlUnitId = 1,
                authorContact = "Jean Bon",
                title = "Une observation",
                description = "Une description",
            )

        // When
        val reporting = jpaReportingRepository.update(reportingId = 8, updatedReporting)

        // Then
        assertThat(reporting.cfr).isEqualTo("ABC000597493")
        assertThat((reporting as Reporting.Observation).reportingSource).isEqualTo(updatedReporting.reportingSource)
        assertThat((reporting).controlUnitId).isEqualTo(updatedReporting.controlUnitId)
        assertThat((reporting).authorContact).isEqualTo(updatedReporting.authorContact)
        assertThat((reporting).title).isEqualTo(updatedReporting.title)
        assertThat((reporting).description).isEqualTo(updatedReporting.description)
    }

    @Test
    @Transactional
    fun `update Should convert an InfractionSuspicion to an Observation`() {
        // Given
        val updatedReporting =
            Reporting.Observation(
                cfr = "FRFGRGR",
                externalMarker = "RGD",
                ircs = "6554fEE",
                vesselId = 523,
                creationDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                flagState = CountryCode.FR,
                type = ReportingType.OBSERVATION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
                reportingSource = ReportingSource.UNIT,
                id = 7,
                controlUnitId = 1,
                authorContact = "Jean Bon",
                title = "Une observation",
                description = "Une description",
            )

        // When
        val reporting = jpaReportingRepository.update(7, updatedReporting)

        // Then
        assertThat(reporting.cfr).isEqualTo("ABC000042310")
        assertThat(reporting.type).isEqualTo(ReportingType.OBSERVATION)
        assertThat((reporting as Reporting.Observation).reportingSource).isEqualTo(updatedReporting.reportingSource)
        assertThat((reporting).controlUnitId).isEqualTo(updatedReporting.controlUnitId)
        assertThat((reporting).authorContact).isEqualTo(updatedReporting.authorContact)
        assertThat((reporting).title).isEqualTo(updatedReporting.title)
        assertThat((reporting).description).isEqualTo(updatedReporting.description)
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

    @Test
    @Transactional
    fun `findAll Should return reportings with position when hasPosition is true`() {
        val filter = ReportingFilter(hasPosition = true)

        val result = jpaReportingRepository.findAll(filter)

        assertThat(result).hasSizeGreaterThan(0)
        assertThat(result.all { it.latitude != null && it.longitude != null }).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `findAll Should return no reportings when hasPosition is false`() {
        val filter = ReportingFilter(hasPosition = false)

        val result = jpaReportingRepository.findAll(filter)

        // All test-data reportings have a position, so none match hasPosition = false
        assertThat(result).isEmpty()
    }
}
