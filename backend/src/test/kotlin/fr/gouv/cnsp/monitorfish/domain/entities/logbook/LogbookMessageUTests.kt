package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledge
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
                analyzedByRules = emptyList(),
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
    fun `consolidateAcknowledge should set acknowledge to successful with one successful RET message`() {
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
                Acknowledge(returnStatus = "000"),
            ),
        )

        // When
        val consolidatedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessage(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(consolidatedLogbookMessage.logbookMessage.reportId).isEqualTo(refenceLogbookMessage.reportId)
        assertThat(consolidatedLogbookMessage.logbookMessage.acknowledge?.isSuccess).isTrue()
        assertThat(consolidatedLogbookMessage.logbookMessage.isCorrected).isFalse()
        assertThat(consolidatedLogbookMessage.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `consolidateAcknowledge should set acknowledge to successful with multiple RET messages of which one is successful, no matter the (historical) order`() {
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
                Acknowledge(returnStatus = "002"),
            ),
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
                Acknowledge(returnStatus = "000"),
            ),
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
                Acknowledge(returnStatus = "001"),
            ),
        )

        // When
        val consolidatedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessage(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(consolidatedLogbookMessage.logbookMessage.reportId).isEqualTo(refenceLogbookMessage.reportId)
        assertThat(consolidatedLogbookMessage.logbookMessage.acknowledge?.isSuccess).isTrue()
        assertThat(consolidatedLogbookMessage.logbookMessage.isCorrected).isFalse()
        assertThat(consolidatedLogbookMessage.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `consolidateAcknowledge should set acknowledge to not successful with one unsuccessful RET message`() {
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
                Acknowledge(returnStatus = "001"),
            ),
        )

        // When
        val consolidatedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessage(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(consolidatedLogbookMessage.logbookMessage.reportId).isEqualTo(refenceLogbookMessage.reportId)
        assertThat(consolidatedLogbookMessage.logbookMessage.acknowledge?.isSuccess).isFalse()
        assertThat(consolidatedLogbookMessage.logbookMessage.isCorrected).isFalse()
        assertThat(consolidatedLogbookMessage.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `consolidateAcknowledge should set acknowledge to (most recent) not successful with multiple unsucessful RET message`() {
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
                Acknowledge(returnStatus = "001"),
            ),
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
                Acknowledge(returnStatus = "002"),
            ),
        )

        // When
        val consolidatedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessage(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(consolidatedLogbookMessage.logbookMessage.reportId).isEqualTo(refenceLogbookMessage.reportId)
        assertThat(consolidatedLogbookMessage.logbookMessage.acknowledge?.isSuccess).isFalse()
        assertThat(consolidatedLogbookMessage.logbookMessage.acknowledge?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC))
        assertThat(consolidatedLogbookMessage.logbookMessage.isCorrected).isFalse()
        assertThat(consolidatedLogbookMessage.logbookMessage.isDeleted).isFalse()

        // When
        val consolidatedLogbookMessageReversed = refenceLogbookMessage
            .toConsolidatedLogbookMessage(relatedLogbookMessages.reversed(), PNO::class.java)

        // Then
        assertThat(consolidatedLogbookMessageReversed.logbookMessage.reportId).isEqualTo(refenceLogbookMessage.reportId)
        assertThat(consolidatedLogbookMessageReversed.logbookMessage.acknowledge?.isSuccess).isFalse()
        assertThat(consolidatedLogbookMessageReversed.logbookMessage.acknowledge?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC))
        assertThat(consolidatedLogbookMessageReversed.logbookMessage.isCorrected).isFalse()
        assertThat(consolidatedLogbookMessageReversed.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `consolidateAcknowledge should set acknowledge to successful when it comes from FLUX flow`() {
        // Given
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        ).copy(
            transmissionFormat = LogbookTransmissionFormat.FLUX,
        )

        // When
        val consolidatedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessage(emptyList(), PNO::class.java)

        // Then
        assertThat(consolidatedLogbookMessage.logbookMessage.reportId).isEqualTo(refenceLogbookMessage.reportId)
        assertThat(consolidatedLogbookMessage.logbookMessage.acknowledge?.isSuccess).isTrue()
        assertThat(consolidatedLogbookMessage.logbookMessage.isCorrected).isFalse()
        assertThat(consolidatedLogbookMessage.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `consolidateAcknowledge should set acknowledge to successful when it was generated via VISIOCaptures app`() {
        // Given
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        ).copy(
            software = "... VISIOCaptures ...",
        )

        // When
        val consolidatedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessage(emptyList(), PNO::class.java)

        // Then
        assertThat(consolidatedLogbookMessage.logbookMessage.reportId).isEqualTo(refenceLogbookMessage.reportId)
        assertThat(consolidatedLogbookMessage.logbookMessage.acknowledge?.isSuccess).isTrue()
        assertThat(consolidatedLogbookMessage.logbookMessage.isCorrected).isFalse()
        assertThat(consolidatedLogbookMessage.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `consolidateAcknowledge should flag it as corrected from a COR message`() {
        // Given
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.COR,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        )

        // When
        val consolidatedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessage(emptyList(), PNO::class.java)

        // Then
        assertThat(consolidatedLogbookMessage.logbookMessage.reportId).isEqualTo(refenceLogbookMessage.reportId)
        assertThat(consolidatedLogbookMessage.logbookMessage.reportDateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC))
        assertThat(consolidatedLogbookMessage.logbookMessage.isCorrected).isTrue()
        assertThat(consolidatedLogbookMessage.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `consolidateAcknowledge should use the most recent COR message as base and flag it corrected from a DAT with multiple COR messages`() {
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
        val consolidatedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessage(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(consolidatedLogbookMessage.logbookMessage.reportId).isEqualTo(refenceLogbookMessage.reportId)
        assertThat(consolidatedLogbookMessage.logbookMessage.reportDateTime).isEqualTo(
            ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC),
        )
        assertThat(consolidatedLogbookMessage.logbookMessage.isCorrected).isTrue()
        assertThat(consolidatedLogbookMessage.logbookMessage.isDeleted).isFalse()

        // When
        val consolidatedLogbookMessageReversed = refenceLogbookMessage
            .toConsolidatedLogbookMessage(relatedLogbookMessages.reversed(), PNO::class.java)

        // Then
        assertThat(consolidatedLogbookMessageReversed.logbookMessage.reportId).isEqualTo(refenceLogbookMessage.reportId)
        assertThat(consolidatedLogbookMessageReversed.logbookMessage.reportDateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC))
        assertThat(consolidatedLogbookMessageReversed.logbookMessage.isCorrected).isTrue()
        assertThat(consolidatedLogbookMessageReversed.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `consolidateAcknowledge should flag it as deleted from a DAT with a DEL message`() {
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
        val consolidatedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessage(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(consolidatedLogbookMessage.logbookMessage.reportId).isEqualTo(refenceLogbookMessage.reportId)
        assertThat(consolidatedLogbookMessage.logbookMessage.reportDateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC))
        assertThat(consolidatedLogbookMessage.logbookMessage.isCorrected).isFalse()
        assertThat(consolidatedLogbookMessage.logbookMessage.isDeleted).isTrue()
    }

    @Test
    fun `consolidateAcknowledge should flag it as corrected and deleted from a COR with a DEL message`() {
        // Given
        val refenceLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.COR,
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
        val consolidatedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessage(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(consolidatedLogbookMessage.logbookMessage.reportId).isEqualTo(refenceLogbookMessage.reportId)
        assertThat(consolidatedLogbookMessage.logbookMessage.reportDateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC))
        assertThat(consolidatedLogbookMessage.logbookMessage.isCorrected).isTrue()
        assertThat(consolidatedLogbookMessage.logbookMessage.isDeleted).isTrue()
    }

    @Test
    fun `consolidateAcknowledge should use the most recent COR message as base and flag it corrected and deleted from a DAT with COR and DEL messages`() {
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
        val consolidatedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessage(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(consolidatedLogbookMessage.logbookMessage.reportId).isEqualTo(refenceLogbookMessage.reportId)
        assertThat(consolidatedLogbookMessage.logbookMessage.reportDateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC))
        assertThat(consolidatedLogbookMessage.logbookMessage.isCorrected).isTrue()
        assertThat(consolidatedLogbookMessage.logbookMessage.isDeleted).isTrue()
    }

    @Test
    fun `consolidateAcknowledge should use the most recent COR message as base and associate its RET from a DAT, even with a later DAT-RET message`() {
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
                Acknowledge(returnStatus = "000"),
            ),
            corLogbookMessage,
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC),
                // This second RET message is related to the COR and not DAT message.
                corLogbookMessage.reportId,
                Acknowledge(returnStatus = "002"),
            ),
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 4, 0, ZoneOffset.UTC),
                // This third RET message is related to the COR and not DAT message.
                corLogbookMessage.reportId,
                Acknowledge(returnStatus = "001"),
            ),
            getFakeLogbookMessage(
                LogbookOperationType.RET,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 5, 0, ZoneOffset.UTC),
                // This fourth RET message is related to the DAT message.
                refenceLogbookMessage.reportId,
                Acknowledge(returnStatus = "000"),
            ),
        )

        // When
        val consolidatedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessage(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(consolidatedLogbookMessage.logbookMessage.reportId).isEqualTo(refenceLogbookMessage.reportId)
        assertThat(consolidatedLogbookMessage.logbookMessage.reportDateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC))
        assertThat(consolidatedLogbookMessage.logbookMessage.acknowledge?.isSuccess).isFalse()
        assertThat(consolidatedLogbookMessage.logbookMessage.acknowledge?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 4, 0, ZoneOffset.UTC))
        assertThat(consolidatedLogbookMessage.logbookMessage.acknowledge?.returnStatus).isEqualTo("001")
        assertThat(consolidatedLogbookMessage.logbookMessage.isCorrected).isTrue()
        assertThat(consolidatedLogbookMessage.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `consolidateAcknowledge should use the most recent COR message as base and skip acknowledgement flagging without a COR-related RET`() {
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
                Acknowledge(returnStatus = "000"),
            ),
            getFakeLogbookMessage(
                LogbookOperationType.COR,
                ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
                refenceLogbookMessage.reportId,
            ),
        )

        // When
        val consolidatedLogbookMessage = refenceLogbookMessage
            .toConsolidatedLogbookMessage(relatedLogbookMessages, PNO::class.java)

        // Then
        assertThat(consolidatedLogbookMessage.logbookMessage.reportId).isEqualTo(refenceLogbookMessage.reportId)
        assertThat(consolidatedLogbookMessage.logbookMessage.reportDateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC))
        assertThat(consolidatedLogbookMessage.logbookMessage.acknowledge).isNull()
        assertThat(consolidatedLogbookMessage.logbookMessage.isCorrected).isTrue()
        assertThat(consolidatedLogbookMessage.logbookMessage.isDeleted).isFalse()
    }

    @Test
    fun `setAcknowledge should create a new successful acknowledgment when current is null`() {
        // Given
        val logbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        )
        val newAcknowledgeMessage = getFakeLogbookMessage(
            LogbookOperationType.RET,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
            logbookMessage.reportId,
            Acknowledge(returnStatus = "000"),
        )

        // When
        logbookMessage.setAcknowledge(newAcknowledgeMessage)

        // Then
        assertThat(logbookMessage.acknowledge?.isSuccess).isTrue()
        assertThat(logbookMessage.acknowledge?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC))
    }

    @Test
    fun `setAcknowledge should create a new unsuccessful acknowledgment when current is null`() {
        // Given
        val logbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        )
        val newAcknowledgeMessage = getFakeLogbookMessage(
            LogbookOperationType.RET,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
            logbookMessage.reportId,
            Acknowledge(returnStatus = "001"),
        )

        // When
        logbookMessage.setAcknowledge(newAcknowledgeMessage)

        // Then
        assertThat(logbookMessage.acknowledge?.isSuccess).isFalse()
        assertThat(logbookMessage.acknowledge?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC))
    }

    @Test
    fun `setAcknowledge should update to a new successful acknowledgment when current is unsuccesful, whenever it happened`() {
        // Given
        val firstLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        ).copy(
            acknowledge = Acknowledge(
                isSuccess = false,
                dateTime = ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
            ),
        )
        val firstNewAcknowledgeMessage = getFakeLogbookMessage(
            LogbookOperationType.RET,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
            firstLogbookMessage.reportId,
            Acknowledge(returnStatus = "000"),
        )

        // When
        firstLogbookMessage.setAcknowledge(firstNewAcknowledgeMessage)

        // Then
        assertThat(firstLogbookMessage.acknowledge?.isSuccess).isTrue()
        assertThat(firstLogbookMessage.acknowledge?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC))

        // Given
        val secondLogbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        ).copy(
            acknowledge = Acknowledge(
                isSuccess = false,
                dateTime = ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC),
            ),
        )
        val secondNewAcknowledgeMessage = getFakeLogbookMessage(
            LogbookOperationType.RET,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
            secondLogbookMessage.reportId,
            Acknowledge(returnStatus = "000"),
        )

        // When
        secondLogbookMessage.setAcknowledge(secondNewAcknowledgeMessage)

        // Then
        assertThat(secondLogbookMessage.acknowledge?.isSuccess).isTrue()
        assertThat(secondLogbookMessage.acknowledge?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC))
    }

    @Test
    fun `setAcknowledge should only update to a new acknowledgement when it's more recent than the current one (but is not a positive success switch)`() {
        // Given
        val logbookMessage = getFakeLogbookMessage(
            LogbookOperationType.DAT,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
        ).copy(
            acknowledge = Acknowledge(
                isSuccess = true,
                dateTime = ZonedDateTime.of(2024, 1, 1, 0, 0, 1, 0, ZoneOffset.UTC),
            ),
        )
        val firstNewAcknowledgeMessage = getFakeLogbookMessage(
            LogbookOperationType.RET,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC),
            logbookMessage.reportId,
            Acknowledge(returnStatus = "000"),
        )

        // When
        logbookMessage.setAcknowledge(firstNewAcknowledgeMessage)

        // Then
        assertThat(logbookMessage.acknowledge?.isSuccess).isTrue()
        assertThat(logbookMessage.acknowledge?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC))

        // Given
        val secondNewAcknowledgeMessage = getFakeLogbookMessage(
            LogbookOperationType.RET,
            ZonedDateTime.of(2024, 1, 1, 0, 0, 2, 0, ZoneOffset.UTC),
            logbookMessage.reportId,
            Acknowledge(returnStatus = "000"),
        )

        // When
        logbookMessage.setAcknowledge(secondNewAcknowledgeMessage)

        // Then
        assertThat(logbookMessage.acknowledge?.isSuccess).isTrue()
        assertThat(logbookMessage.acknowledge?.dateTime)
            .isEqualTo(ZonedDateTime.of(2024, 1, 1, 0, 0, 3, 0, ZoneOffset.UTC))
    }
}
