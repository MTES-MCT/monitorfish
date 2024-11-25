import { COEMessage } from './COEMessage'
import { COXMessage } from './COXMessage'
import { CPSMessage } from './CPSMessage'
import { CROMessage } from './CROMessage'
import { DEPMessage } from './DEPMessage'
import { DISMessage } from './DISMessage'
import { EOFMessage } from './EOFMessage'
import { FARMessage } from './FARMessage'
import { LANMessage } from './LANMessage'
import { NotImplementedMessage } from './NotImplementedMessage'
import { PNOMessage } from './PNOMessage'
import { RTPMessage } from './RTPMessage'
import { LogbookMessageType } from '../../../../constants'

import type { Logbook } from '../../../../Logbook.types'

export function getComponentFromMessageType(logbookMessage: Logbook.Message, isManuallyCreated: boolean) {
  switch (logbookMessage.messageType) {
    case LogbookMessageType.DEP.code:
      return <DEPMessage messageValue={logbookMessage.message as Logbook.DepMessageValue} />
    case LogbookMessageType.FAR.code:
      return <FARMessage message={logbookMessage.message as Logbook.FarMessageValue} />
    case LogbookMessageType.PNO.code:
      return (
        <PNOMessage
          isManuallyCreated={isManuallyCreated}
          messageValue={logbookMessage.message as Logbook.PnoMessageValue}
          tripGears={logbookMessage.tripGears}
        />
      )
    case LogbookMessageType.LAN.code:
      return <LANMessage messageValue={logbookMessage.message as Logbook.LanMessageValue} />
    case LogbookMessageType.RTP.code:
      return <RTPMessage messageValue={logbookMessage.message as Logbook.RtpMessageValue} />
    case LogbookMessageType.EOF.code:
      return <EOFMessage messageValue={logbookMessage.message as Logbook.EofMessageValue} />
    case LogbookMessageType.COE.code:
      return <COEMessage messageValue={logbookMessage.message as Logbook.CoeMessageValue} />
    case LogbookMessageType.CPS.code:
      return <CPSMessage message={logbookMessage.message as Logbook.CpsMessageValue} />
    case LogbookMessageType.NOT_COE.code:
      return <COEMessage messageValue={logbookMessage.message as Logbook.CoeMessageValue} />
    case LogbookMessageType.COX.code:
      return <COXMessage messageValue={logbookMessage.message as Logbook.CoxMessageValue} />
    case LogbookMessageType.NOT_COX.code:
      return <COXMessage messageValue={logbookMessage.message as Logbook.CoxMessageValue} />
    case LogbookMessageType.JFO.code:
      return <NotImplementedMessage />
    case LogbookMessageType.CRO.code:
      return <CROMessage messageValue={logbookMessage.message as Logbook.CroMessageValue} />
    case LogbookMessageType.DIS.code:
      return <DISMessage messageValue={logbookMessage.message as Logbook.DisMessageValue} />
    case LogbookMessageType.RLC.code:
      return <NotImplementedMessage />
    case LogbookMessageType.TRA.code:
      return <NotImplementedMessage />
    case LogbookMessageType.NOT_TRA.code:
      return <NotImplementedMessage />
    case LogbookMessageType.GEAR_SHOT.code:
      return <NotImplementedMessage />
    case LogbookMessageType.GEAR_RETRIEVAL.code:
      return <NotImplementedMessage />
    case LogbookMessageType.START_ACTIVITY.code:
      return <NotImplementedMessage />
    case LogbookMessageType.START_FISHING.code:
      return <NotImplementedMessage />
    default:
      return undefined
  }
}
