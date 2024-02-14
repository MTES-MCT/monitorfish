import { useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../../../constants/constants'
import { LogbookMessageResumeHeader } from '../LogbookMessageResumeHeader'

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
        isNotAcknowledged={false}
        isOpen={isOpen}
        messageType={messageType}
        noContent
        onHoverText={title}
        setIsOpen={setIsOpen}
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
