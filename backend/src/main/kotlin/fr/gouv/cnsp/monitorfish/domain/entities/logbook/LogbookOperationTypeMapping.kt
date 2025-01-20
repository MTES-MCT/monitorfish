package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledgment
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LogbookMessageValue

enum class LogbookOperationTypeMapping(
    private val clazz: Class<out LogbookMessageValue>,
) : IHasImplementation {
    RET(Acknowledgment::class.java),

    ;

    override fun getImplementation(): Class<out LogbookMessageValue> = clazz

    companion object {
        fun getClassFromName(operationType: String): Class<out LogbookMessageValue> =
            try {
                entries.first { it.name == operationType }.getImplementation()
            } catch (e: Exception) {
                throw NoSuchElementException("Operation type $operationType not found", e)
            }
    }
}
