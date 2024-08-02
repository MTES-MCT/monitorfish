package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledgment
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LogbookMessageValue
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
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
    fun `toConsolidatedLogbookMessageAndValue Should set acknowledge to successful with one successful RET message`() {
        // Given
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        )
        val relatedLogbookMessages = listOf(
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
                Acknowledgment(returnStatus = "000"),
            ),
        )

        // When
        val enrichedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessageAndValue(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(enrichedLogbookMessage.logbookMessage.acknowledgment?.isSuccess).isTrue()
        assertThat(enrichedLogbookMessage.logbookMessage.isCorrectedByNewerMessage).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `toConsolidatedLogbookMessageAndValue Should set acknowledge to successful with multiple RET messages of which one is successful, no matter the (historical) order`() {
        // Given
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        )
        val relatedLogbookMessages = listOf(
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
                Acknowledgment(returnStatus = "002"),
            ),
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
                Acknowledgment(returnStatus = "000"),
            ),
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
                Acknowledgment(returnStatus = "001"),
            ),
        )

        // When
        val enrichedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessageAndValue(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(enrichedLogbookMessage.logbookMessage.acknowledgment?.isSuccess).isTrue()
        assertThat(enrichedLogbookMessage.logbookMessage.isCorrectedByNewerMessage).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `toConsolidatedLogbookMessageAndValue Should set acknowledge to not successful with one unsuccessful RET message`() {
        // Given
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        )
        val relatedLogbookMessages = listOf(
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
                Acknowledgment(returnStatus = "001"),
            ),
        )

        // When
        val enrichedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessageAndValue(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(enrichedLogbookMessage.logbookMessage.acknowledgment?.isSuccess).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.isCorrectedByNewerMessage).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `toConsolidatedLogbookMessageAndValue Should set acknowledge to (most recent) not successful with multiple unsucessful RET message`() {
        // Given
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        )
        val relatedLogbookMessages = listOf(
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
                Acknowledgment(returnStatus = "001"),
            ),
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
                Acknowledgment(returnStatus = "002"),
            ),
        )

        // When
        val enrichedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessageAndValue(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(enrichedLogbookMessage.logbookMessage.acknowledgment?.isSuccess).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.acknowledgment?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC))
        assertThat(enrichedLogbookMessage.logbookMessage.isCorrectedByNewerMessage).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.isDeleted).isFalse()

        // When
        val enrichedLogbookMessageReversed = refenceLogbookMessage
            .toConsolidatedLogbookMessageAndValue(relatedLogbookMessages.reversed(), PNO::class.java)

        // Then
        assertThat(enrichedLogbookMessageReversed.logbookMessage.acknowledgment?.isSuccess).isFalse()
        assertThat(enrichedLogbookMessageReversed.logbookMessage.acknowledgment?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC))
        assertThat(enrichedLogbookMessageReversed.logbookMessage.isCorrectedByNewerMessage).isFalse()
        assertThat(enrichedLogbookMessageReversed.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `toConsolidatedLogbookMessageAndValue Should set acknowledge to successful when it comes from FLUX flow`() {
        // Given
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        ).copy(
            transmissionFormat = LogbookTransmissionFormat.FLUX,
        )

        // When
        val enrichedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessageAndValue(emptyList(), PNO::class.java)

        // Then
        assertThat(enrichedLogbookMessage.logbookMessage.acknowledgment?.isSuccess).isTrue()
        assertThat(enrichedLogbookMessage.logbookMessage.isCorrectedByNewerMessage).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `toConsolidatedLogbookMessageAndValue Should set acknowledge to successful when it was generated via VISIOCaptures app`() {
        // Given
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        ).copy(
            software = "... VISIOCaptures ...",
        )

        // When
        val enrichedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessageAndValue(emptyList(), PNO::class.java)

        // Then
        assertThat(enrichedLogbookMessage.logbookMessage.acknowledgment?.isSuccess).isTrue()
        assertThat(enrichedLogbookMessage.logbookMessage.isCorrectedByNewerMessage).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `toConsolidatedLogbookMessageAndValue Should flag it as corrected from an orphan COR message`() {
        // Given
        val missingDatLogbookMessageReportId = UUID.randomUUID().toString()
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.COR,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
            missingDatLogbookMessageReportId,
        )

        // When
        val enrichedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessageAndValue(emptyList(), PNO::class.java)

        // Then
        assertThat(enrichedLogbookMessage.logbookMessage.reportDateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC))
        assertThat(enrichedLogbookMessage.logbookMessage.isCorrectedByNewerMessage).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `toConsolidatedLogbookMessageAndValue Should use the most recent COR message as base and flag it corrected from a DAT with multiple COR messages`() {
        // Given
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        )
        val relatedLogbookMessages = listOf(
            getFakeLogbookMessage(
                LogbookOperationType.COR,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
            ),
            getFakeLogbookMessage(
                LogbookOperationType.COR,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
            ),
            getFakeLogbookMessage(
                LogbookOperationType.COR,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
            ),
        )

        // When
        val enrichedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessageAndValue(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(enrichedLogbookMessage.logbookMessage.reportDateTime).isEqualTo(
            ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC),
        )
        assertThat(enrichedLogbookMessage.logbookMessage.isCorrectedByNewerMessage).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.isDeleted).isFalse()

        // When
        val enrichedLogbookMessageReversed = refenceLogbookMessage
            .toConsolidatedLogbookMessageAndValue(relatedLogbookMessages.reversed(), PNO::class.java)

        // Then
        assertThat(enrichedLogbookMessageReversed.logbookMessage.reportDateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC))
        assertThat(enrichedLogbookMessageReversed.logbookMessage.isCorrectedByNewerMessage).isFalse()
        assertThat(enrichedLogbookMessageReversed.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `toConsolidatedLogbookMessageAndValue Should flag it as deleted from a DAT with a DEL message`() {
        // Given
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        )
        val relatedLogbookMessages = listOf(
            getFakeLogbookMessage(
                LogbookOperationType.DEL,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
            ),
        )

        // When
        val enrichedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessageAndValue(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(enrichedLogbookMessage.logbookMessage.reportDateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC))
        assertThat(enrichedLogbookMessage.logbookMessage.isCorrectedByNewerMessage).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.isDeleted).isTrue()
    }

    @Test
    fun `toConsolidatedLogbookMessageAndValue Should flag it as corrected and deleted from an orphan COR with a DEL message`() {
        // Given
        val missingDatLogbookMessageReportId = UUID.randomUUID().toString()
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.COR,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
            missingDatLogbookMessageReportId,
        )
        val relatedLogbookMessages = listOf(
            getFakeLogbookMessage(
                LogbookOperationType.DEL,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
            ),
        )

        // When
        val enrichedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessageAndValue(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(enrichedLogbookMessage.logbookMessage.reportDateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC))
        assertThat(enrichedLogbookMessage.logbookMessage.isCorrectedByNewerMessage).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.isDeleted).isTrue()
    }

    @Test
    fun `toConsolidatedLogbookMessageAndValue Should use the most recent COR message as base and flag it corrected and deleted from a DAT with COR and DEL messages`() {
        // Given
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        )
        val relatedLogbookMessages = listOf(
            getFakeLogbookMessage(
                LogbookOperationType.COR,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
            ),
            getFakeLogbookMessage(
                LogbookOperationType.COR,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
            ),
            getFakeLogbookMessage(
                LogbookOperationType.DEL,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
            ),
        )

        // When
        val enrichedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessageAndValue(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(enrichedLogbookMessage.logbookMessage.reportDateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC))
        assertThat(enrichedLogbookMessage.logbookMessage.isCorrectedByNewerMessage).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.isDeleted).isTrue()
    }

    @Test
    fun `toConsolidatedLogbookMessageAndValue Should use the most recent COR message as base and associate its RET from a DAT, even with a later DAT-RET message`() {
        // Given
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        )
        val corLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.COR,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
            refenceLogbookMessage.reportId,
        )
        val relatedLogbookMessages = listOf(
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
                // This first RET message is related to the DAT message.
                refenceLogbookMessage.reportId,
                Acknowledgment(returnStatus = "000"),
            ),
            corLogbookMessage,
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC),
                // This second RET message is related to the COR and not DAT message.
                corLogbookMessage.reportId,
                Acknowledgment(returnStatus = "002"),
            ),
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 4, 0, ZoneOffset.UTC),
                // This third RET message is related to the COR and not DAT message.
                corLogbookMessage.reportId,
                Acknowledgment(returnStatus = "001"),
            ),
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 5, 0, ZoneOffset.UTC),
                // This fourth RET message is related to the DAT message.
                refenceLogbookMessage.reportId,
                Acknowledgment(returnStatus = "000"),
            ),
        )

        // When
        val enrichedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessageAndValue(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(enrichedLogbookMessage.logbookMessage.reportDateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC))
        assertThat(enrichedLogbookMessage.logbookMessage.acknowledgment?.isSuccess).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.acknowledgment?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 4, 0, ZoneOffset.UTC))
        assertThat(enrichedLogbookMessage.logbookMessage.acknowledgment?.returnStatus).isEqualTo("001")
        assertThat(enrichedLogbookMessage.logbookMessage.isCorrectedByNewerMessage).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `toConsolidatedLogbookMessageAndValue Should use the most recent COR message as base and skip acknowledgement flagging without a COR-related RET`() {
        // Given
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        )
        val relatedLogbookMessages = listOf(
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
                // This first RET message is related to the DAT message.
                refenceLogbookMessage.reportId,
                Acknowledgment(returnStatus = "000"),
            ),
            getFakeLogbookMessage(
                LogbookOperationType.COR,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
            ),
        )

        // When
        val enrichedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessageAndValue(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(enrichedLogbookMessage.logbookMessage.reportDateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC))
        assertThat(enrichedLogbookMessage.logbookMessage.acknowledgment).isNull()
        assertThat(enrichedLogbookMessage.logbookMessage.isCorrectedByNewerMessage).isFalse()
        assertThat(enrichedLogbookMessage.logbookMessage.isDeleted).isFalse()
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
