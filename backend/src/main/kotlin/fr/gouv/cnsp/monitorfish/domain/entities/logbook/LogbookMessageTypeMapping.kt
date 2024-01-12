package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LogbookMessageValue
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.COE as COEMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.COX as COXMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.CRO as CROMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.DEP as DEPMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.DIS as DISMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.EOF as EOFMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.FAR as FARMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.CPS as CPSMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LAN as LANMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.NotImplemented as NotImplementedMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO as PNOMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.RTP as RTPMessage

enum class LogbookMessageTypeMapping(private val clazz: Class<out LogbookMessageValue>) : IHasImplementation {
    FAR(FARMessage::class.java),
    CPS(CPSMessage::class.java),
    DEP(DEPMessage::class.java),
    DIS(DISMessage::class.java),
    COX(COXMessage::class.java),
    NOT_COX(COXMessage::class.java),
    COE(COEMessage::class.java),
    NOT_COE(COEMessage::class.java),
    CRO(CROMessage::class.java),
    EOF(EOFMessage::class.java),
    LAN(LANMessage::class.java),
    PNO(PNOMessage::class.java),
    RTP(RTPMessage::class.java),
    RLC(NotImplementedMessage::class.java),
    TRA(NotImplementedMessage::class.java),
    NOT_TRA(NotImplementedMessage::class.java),
    GEAR_SHOT(NotImplementedMessage::class.java),
    GEAR_RETRIEVAL(NotImplementedMessage::class.java),
    START_ACTIVITY(NotImplementedMessage::class.java),
    START_FISHING(NotImplementedMessage::class.java),

    ;

    override fun getImplementation(): Class<out LogbookMessageValue> {
        return clazz
    }

    companion object {
        fun getClassFromName(messageType: String): Class<out LogbookMessageValue> {
            return values().first { it.name == messageType }.getImplementation()
        }
    }
}
