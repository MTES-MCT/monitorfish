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

import type { LogbookMessage } from '../../../../LegacyLogbook.types'
import type { Logbook as LogbookMessageNamespace } from '../../../../Logbook.types'

export function getComponentFromMessageType(
  logbookMessage: LogbookMessage | LogbookMessageNamespace.Message,
  isManuallyCreated: boolean
) {
  switch (logbookMessage.messageType) {
    case LogbookMessageType.DEP.code:
      return <DEPMessage messageValue={logbookMessage.message} />
    case LogbookMessageType.FAR.code:
      return <FARMessage message={logbookMessage.message} />
    case LogbookMessageType.PNO.code:
      return (
        <PNOMessage
          isManuallyCreated={isManuallyCreated}
          messageValue={logbookMessage.message}
          tripGears={logbookMessage.tripGears}
        />
      )
    case LogbookMessageType.LAN.code:
      return <LANMessage messageValue={logbookMessage.message} />
    case LogbookMessageType.RTP.code:
      return <RTPMessage messageValue={logbookMessage.message} />
    case LogbookMessageType.EOF.code:
      return <EOFMessage messageValue={logbookMessage.message} />
    case LogbookMessageType.COE.code:
      return <COEMessage messageValue={logbookMessage.message} />
    case LogbookMessageType.CPS.code:
      return <CPSMessage message={logbookMessage.message} />
    case LogbookMessageType.NOT_COE.code:
      return <COEMessage messageValue={logbookMessage.message} />
    case LogbookMessageType.COX.code:
      return <COXMessage messageValue={logbookMessage.message} />
    case LogbookMessageType.NOT_COX.code:
      return <COXMessage messageValue={logbookMessage.message} />
    case LogbookMessageType.JFO.code:
      return <NotImplementedMessage />
    case LogbookMessageType.CRO.code:
      return <CROMessage messageValue={logbookMessage.message} />
    case LogbookMessageType.DIS.code:
      return <DISMessage messageValue={logbookMessage.message} />
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
