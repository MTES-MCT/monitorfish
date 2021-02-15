package fr.gouv.cnsp.monitorfish.domain.entities.ers

import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.ERSMessageValue
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.DEP as DEPMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.DIS as DISMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.COE as COEMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.COX as COXMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.CRO as CROMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.EOF as EOFMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.FAR as FARMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.LAN as LANMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.PNO as PNOMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.RTP as RTPMessage

enum class ERSMessageTypeMapping(private val clazz: Class<out ERSMessageValue>) : IHasImplementation {
    FAR(FARMessage::class.java),
    DEP(DEPMessage::class.java),
    DIS(DISMessage::class.java),
    COX(COXMessage::class.java),
    COE(COEMessage::class.java),
    CRO(CROMessage::class.java),
    EOF(EOFMessage::class.java),
    LAN(LANMessage::class.java),
    PNO(PNOMessage::class.java),
    RTP(RTPMessage::class.java);

    override fun getImplementation(): Class<out ERSMessageValue> {
        return clazz
    }

    companion object {
        fun getClassFromName(messageType: String): Class<out ERSMessageValue> {
            return values().first{ it.name == messageType }.getImplementation()
        }
    }
}
