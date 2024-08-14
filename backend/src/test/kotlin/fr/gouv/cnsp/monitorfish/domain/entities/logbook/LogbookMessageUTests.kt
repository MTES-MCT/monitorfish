package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledgment
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LogbookMessageValue
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.util.*

@ExtendWith(SpringExtension::class)
class LogbookMessageUTests {
    companion object {
        private fun getFakeLogbookMessage(
            operationType: LogbookOperationType,
            reportDateTime: ZonedDateTime?,
            referenceReportId: String? = null,
            message: LogbookMessageValue? = null,
        ): LogbookMessage {
            val id: Long = Random().nextLong()
            val reportId = UUID.randomUUID().toString()

            return LogbookMessage(
                id = id,
                reportId = reportId,
                referencedReportId = referenceReportId,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                message = message,
                operationDateTime = ZonedDateTime.now(),
                operationNumber = "FAKE_OPERATION_NUMBER_$reportId",
                operationType = operationType,
                reportDateTime = reportDateTime,
                transmissionFormat = LogbookTransmissionFormat.ERS,
            )
        }
    }

    @Test
    fun `setAcknowledge should create a new successful acknowledgment when current is null`() {
        // Given
        val logbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        )
        val newAcknowledgmentMessage = getFakeLogbookMessage(
            LogbookOperationType.RET,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
            logbookMessage.reportId,
            Acknowledgment(returnStatus = "000"),
        )

        // When
        logbookMessage.setAcknowledge(newAcknowledgmentMessage)

        // Then
        assertThat(logbookMessage.acknowledgment?.isSuccess).isTrue()
        assertThat(logbookMessage.acknowledgment?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC))
    }

    @Test
    fun `setAcknowledge should create a new unsuccessful acknowledgment when current is null`() {
        // Given
        val logbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        )
        val newAcknowledgmentMessage = getFakeLogbookMessage(
            LogbookOperationType.RET,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
            logbookMessage.reportId,
            Acknowledgment(returnStatus = "001"),
        )

        // When
        logbookMessage.setAcknowledge(newAcknowledgmentMessage)

        // Then
        assertThat(logbookMessage.acknowledgment?.isSuccess).isFalse()
        assertThat(logbookMessage.acknowledgment?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC))
    }

    @Test
    fun `setAcknowledge should update to a new acknowledgment when it's a SUCCESSFUL one while the current is a FAILED one, whenever it happened`() {
        // Given
        val firstLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        ).copy(
            acknowledgment = Acknowledgment(
                isSuccess = false,
                dateTime = ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
            ),
        )
        val firstNewAcknowledgmentMessage = getFakeLogbookMessage(
            LogbookOperationType.RET,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
            firstLogbookMessage.reportId,
            Acknowledgment(returnStatus = "000"),
        )

        // When
        firstLogbookMessage.setAcknowledge(firstNewAcknowledgmentMessage)

        // Then
        assertThat(firstLogbookMessage.acknowledgment?.isSuccess).isTrue()
        assertThat(firstLogbookMessage.acknowledgment?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC))

        // Given
        val secondLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        ).copy(
            acknowledgment = Acknowledgment(
                isSuccess = false,
                dateTime = ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC),
            ),
        )
        val secondNewAcknowledgmentMessage = getFakeLogbookMessage(
            LogbookOperationType.RET,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
            secondLogbookMessage.reportId,
            Acknowledgment(returnStatus = "000"),
        )

        // When
        secondLogbookMessage.setAcknowledge(secondNewAcknowledgmentMessage)

        // Then
        assertThat(secondLogbookMessage.acknowledgment?.isSuccess).isTrue()
        assertThat(secondLogbookMessage.acknowledgment?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC))
    }

    @Test
    fun `setAcknowledge should update to a new acknowledgement when it's more recent FAILED one than the current FAILED one`() {
        // Given
        val logbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        ).copy(
            acknowledgment = Acknowledgment(
                isSuccess = false,
                dateTime = ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
                returnStatus = "001",
            ),
        )
        val firstNewAcknowledgmentMessage = getFakeLogbookMessage(
            LogbookOperationType.RET,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC),
            logbookMessage.reportId,
            Acknowledgment(returnStatus = "002"),
        )

        // When
        logbookMessage.setAcknowledge(firstNewAcknowledgmentMessage)

        // Then
        assertThat(logbookMessage.acknowledgment?.isSuccess).isFalse()
        assertThat(logbookMessage.acknowledgment?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC))
        assertThat(logbookMessage.acknowledgment?.returnStatus).isEqualTo("002")

        // Given
        val secondNewAcknowledgmentMessage = getFakeLogbookMessage(
            LogbookOperationType.RET,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
            logbookMessage.reportId,
            Acknowledgment(returnStatus = "001"),
        )

        // When
        logbookMessage.setAcknowledge(secondNewAcknowledgmentMessage)

        // Then
        assertThat(logbookMessage.acknowledgment?.isSuccess).isFalse()
        assertThat(logbookMessage.acknowledgment?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC))
        assertThat(logbookMessage.acknowledgment?.returnStatus).isEqualTo("002")
    }

    @Test
    fun `setAcknowledge should NOT update to a new acknowledgement when it's more recent SUCCESSFUL one than the current SUCCESSFUL one`() {
        // Given
        val logbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        ).copy(
            acknowledgment = Acknowledgment(
                isSuccess = true,
                dateTime = ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
                returnStatus = "000",
            ),
        )
        val newAcknowledgmentMessage = getFakeLogbookMessage(
            LogbookOperationType.RET,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
            logbookMessage.reportId,
            Acknowledgment(returnStatus = "000"),
        )

        // When
        logbookMessage.setAcknowledge(newAcknowledgmentMessage)

        // Then
        assertThat(logbookMessage.acknowledgment?.isSuccess).isTrue()
        assertThat(logbookMessage.acknowledgment?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC))
        assertThat(logbookMessage.acknowledgment?.returnStatus).isEqualTo("000")
    }
}
