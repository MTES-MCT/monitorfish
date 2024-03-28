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

import type { LogbookMessage } from '../../../../Logbook.types'
import type { LogbookMessage as LogbookMessageNamespace } from '../../../../LogbookMessage.types'

export function getComponentFromMessageType({
  message,
  messageType
}: LogbookMessage | LogbookMessageNamespace.LogbookMessage) {
  switch (messageType) {
    case LogbookMessageType.DEP.code:
      return <DEPMessage message={message} />
    case LogbookMessageType.FAR.code:
      return <FARMessage message={message} />
    case LogbookMessageType.PNO.code:
      return <PNOMessage message={message} />
    case LogbookMessageType.LAN.code:
      return <LANMessage message={message} />
    case LogbookMessageType.RTP.code:
      return <RTPMessage message={message} />
    case LogbookMessageType.EOF.code:
      return <EOFMessage message={message} />
    case LogbookMessageType.COE.code:
      return <COEMessage message={message} />
    case LogbookMessageType.CPS.code:
      return <CPSMessage message={message} />
    case LogbookMessageType.NOT_COE.code:
      return <COEMessage message={message} />
    case LogbookMessageType.COX.code:
      return <COXMessage message={message} />
    case LogbookMessageType.NOT_COX.code:
      return <COXMessage message={message} />
    case LogbookMessageType.JFO.code:
      return <NotImplementedMessage />
    case LogbookMessageType.CRO.code:
      return <CROMessage message={message} />
    case LogbookMessageType.DIS.code:
      return <DISMessage message={message} />
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
