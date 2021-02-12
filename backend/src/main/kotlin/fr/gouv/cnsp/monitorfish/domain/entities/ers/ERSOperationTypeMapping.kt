package fr.gouv.cnsp.monitorfish.domain.entities.ers

import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.Acknowledge
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.ERSMessageValue

enum class ERSOperationTypeMapping(private val clazz: Class<out ERSMessageValue>) : IHasImplementation {
    RET(Acknowledge::class.java);

    override fun getImplementation(): Class<out ERSMessageValue> {
        return clazz
    }

    companion object {
        fun getClassFromName(operationType: String): Class<out ERSMessageValue> {
            return values().first{ it.name == operationType }.getImplementation()
        }
    }
}
