import { useState } from 'react'
import styled from 'styled-components'

import LogbookMessageResumeHeader from './LogbookMessageResumeHeader'
import { COLORS } from '../../../../constants/constants'

type EmptyResumeProps = {
  messageType: string
}
export function EmptyResume({ messageType }: EmptyResumeProps) {
  const [isOpen, setIsOpen] = useState(false)

  const title = `0 message - aucune capture`

  return (
    <Wrapper>
      <LogbookMessageResumeHeader
        hasNoMessage
        isNotAcknowledged={undefined}
        isOpen={isOpen}
        messageType={messageType}
        noContent
        onHoverText={title}
        setIsOpen={setIsOpen}
        showLogbookMessages={undefined}
        title={<>{title}</>}
      />
    </Wrapper>
  )
}

const Wrapper = styled.li`
  margin: 0;
  border-radius: 0;
  padding: 0;
  overflow: hidden;
  color: ${COLORS.slateGray};
`
