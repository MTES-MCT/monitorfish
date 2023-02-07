package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledge
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LogbookMessageValue

enum class LogbookOperationTypeMapping(private val clazz: Class<out LogbookMessageValue>) : IHasImplementation {
    RET(Acknowledge::class.java),
    ;

    override fun getImplementation(): Class<out LogbookMessageValue> {
        return clazz
    }

    companion object {
        fun getClassFromName(operationType: String): Class<out LogbookMessageValue> {
            return values().first { it.name == operationType }.getImplementation()
        }
    }
}
