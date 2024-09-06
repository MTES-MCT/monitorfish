package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationDocument
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaPriorNotificationUploadRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaPriorNotificationUploadRepository: JpaPriorNotificationUploadRepository

    private val firstFakePriorNotificationDocument =
        PriorNotificationDocument(
            id = null,
            content = "%PDF-1.5\n".toByteArray(),
            createdAt = CustomZonedDateTime.now(),
            fileName = "fake_file_1.pdf",
            isManualPriorNotification = true,
            mimeType = "application/pdf",
            reportId = "00000000-0000-4000-0000-000000000011",
            updatedAt = CustomZonedDateTime.now(),
        )
    private val secondFakePriorNotificationDocument =
        PriorNotificationDocument(
            id = null,
            content = "%PDF-1.5\n".toByteArray(),
            createdAt = CustomZonedDateTime.now(),
            fileName = "fake_file_2.pdf",
            isManualPriorNotification = true,
            mimeType = "application/pdf",
            reportId = "00000000-0000-4000-0000-000000000011",
            updatedAt = CustomZonedDateTime.now(),
        )
    private val thirdFakePriorNotificationDocument =
        PriorNotificationDocument(
            id = null,
            content = "%PDF-1.5\n".toByteArray(),
            createdAt = CustomZonedDateTime.now(),
            fileName = "fake_file_3.pdf",
            isManualPriorNotification = true,
            mimeType = "application/pdf",
            reportId = "00000000-0000-4000-0000-000000000012",
            updatedAt = CustomZonedDateTime.now(),
        )

    private lateinit var firstFakePriorNotificationDocumentId: String
    private lateinit var secondFakePriorNotificationDocumentId: String
    private lateinit var thirdFakePriorNotificationDocumentId: String

    @BeforeEach
    fun beforeEach() {
        var newDocument = jpaPriorNotificationUploadRepository.save(firstFakePriorNotificationDocument)
        firstFakePriorNotificationDocumentId = newDocument.id!!
        newDocument = jpaPriorNotificationUploadRepository.save(secondFakePriorNotificationDocument)
        secondFakePriorNotificationDocumentId = newDocument.id!!
        newDocument = jpaPriorNotificationUploadRepository.save(thirdFakePriorNotificationDocument)
        thirdFakePriorNotificationDocumentId = newDocument.id!!
    }

    @Test
    @Transactional
    fun `deleteById Should delete the expected document`() {
        // When
        jpaPriorNotificationUploadRepository.deleteById(firstFakePriorNotificationDocument.reportId)

        // Then
        val throwable =
            catchThrowable {
                jpaPriorNotificationUploadRepository.findById(firstFakePriorNotificationDocument.reportId)
            }
        assertThat(throwable).isNotNull()
        assertThat((throwable as BackendUsageException).code).isEqualTo(BackendUsageErrorCode.NOT_FOUND)
    }

    @Test
    @Transactional
    fun `findAllByReportId Should return the expected documents`() {
        // Given
        val reportId = "00000000-0000-4000-0000-000000000011"

        // When
        val result = jpaPriorNotificationUploadRepository.findAllByReportId(reportId)

        // Then
        assertThat(result.all { it.reportId == reportId }).isTrue()
    }

    @Test
    @Transactional
    fun `findById Should return the expected document`() {
        // When
        val result = jpaPriorNotificationUploadRepository.findById(firstFakePriorNotificationDocumentId)

        // Then
        assertThat(result.id).isEqualTo(firstFakePriorNotificationDocumentId)
        assertThat(result.reportId).isEqualTo(firstFakePriorNotificationDocument.reportId)
    }

    @Test
    @Transactional
    fun `save Should return the expected document`() {
        // Given
        val newDocument =
            PriorNotificationDocument(
                id = null,
                content = "%PDF-1.5\n".toByteArray(),
                createdAt = CustomZonedDateTime.now(),
                fileName = "fake_file.pdf",
                isManualPriorNotification = true,
                mimeType = "application/pdf",
                reportId = "00000000-0000-4000-0000-000000000013",
                updatedAt = CustomZonedDateTime.now(),
            )

        // When
        jpaPriorNotificationUploadRepository.save(newDocument)

        // Then
        val result = jpaPriorNotificationUploadRepository.findAllByReportId(newDocument.reportId)
        assertThat(result).hasSize(1)
        assertThat(result[0].content.toString()).isEqualTo(newDocument.content.toString())
        assertThat(result[0].reportId).isEqualTo(newDocument.reportId)
    }
}
