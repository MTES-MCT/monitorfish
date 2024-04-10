package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LogbookMessageValue
import fr.gouv.cnsp.monitorfish.domain.exceptions.EntityConversionException

class LogbookMessageTyped<T : LogbookMessageValue>(
    /** Logbook report DAT operation, or last COR one if any, enriched with RET & DEL information if any. */
    val logbookMessage: LogbookMessage,
    private val clazz: Class<T>,
) {
    val typedMessage: T
        get() = if (clazz.isInstance(logbookMessage.message)) {
            clazz.cast(logbookMessage.message)
        } else {
            throw EntityConversionException(
                "Logbook message is not of type $clazz (reportId: ${logbookMessage.reportId}).",
            )
        }
}
