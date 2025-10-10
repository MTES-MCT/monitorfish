import { useState } from 'react'

import { LogbookMessageResumeHeader } from '../LogbookMessageResumeHeader'

type EmptyResumeProps = {
  messageType: string
}

export function EmptyResume({ messageType }: EmptyResumeProps) {
  const [isOpen, setIsOpen] = useState(false)

  const title = `0 message - aucune capture`

  return (
    <>
      <LogbookMessageResumeHeader
        hasNoMessage
        isNotAcknowledged={false}
        isOpen={isOpen}
        messageType={messageType}
        noContent
        onHoverText={title}
        setIsOpen={setIsOpen}
        title={<>{title}</>}
      />
    </>
  )
}
