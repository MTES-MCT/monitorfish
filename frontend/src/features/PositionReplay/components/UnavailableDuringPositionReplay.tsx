import styled from 'styled-components'

type UnavailableDuringPositionReplayProps = Readonly<{
  message: string
  title: string
}>

export function UnavailableDuringPositionReplay({ message, title }: UnavailableDuringPositionReplayProps) {
  return (
    <Wrapper data-cy="unavailable-during-position-replay">
      <Title>{title}</Title>
      <Message>{message}</Message>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin-top: 10px;
  padding: 16px 20px;
  background: ${p => p.theme.color.white};
`

const Title = styled.div`
  color: ${p => p.theme.color.slateGray};
`

const Message = styled.p`
  margin: 8px 0 0;
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
`
