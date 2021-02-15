package fr.gouv.cnsp.monitorfish.domain.entities.ers

import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.ERSMessageValue

interface IHasImplementation {
    fun getImplementation(): Class<out ERSMessageValue>
}