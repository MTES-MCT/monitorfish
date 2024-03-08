import { Accent, Button } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type MapInteractionProps = {
  children?: React.ReactNode
  customTools?: React.ReactNode
  isValidatedButtonDisabled?: boolean
  onReset: () => void
  onValidate: () => void
  resetButtonText?: string
  title: string
  validateButtonText: string
}
export function MapInteraction({
  children = undefined,
  customTools = undefined,
  isValidatedButtonDisabled = false,
  onReset,
  onValidate,
  resetButtonText = undefined,
  title,
  validateButtonText
}: MapInteractionProps) {
  return (
    <Wrapper>
      <Panel>
        <Header>
          <Title>{title}</Title>
        </Header>

        <Body>
          {children}
          <ButtonRow $withCustomTools={!!customTools}>
            {customTools}
            <ButtonGroup>
              <Button accent={Accent.SECONDARY} onClick={onReset}>
                {resetButtonText ?? 'Réinitialiser'}
              </Button>
              <ValidateButton disabled={isValidatedButtonDisabled} onClick={onValidate}>
                {validateButtonText}
              </ValidateButton>
            </ButtonGroup>
          </ButtonRow>
        </Body>
      </Panel>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  z-index: 10;
  width: 580px;
  margin-left: calc(50% - 290px);
  margin-right: calc(50% - 290px);
`
const Panel = styled.div`
  box-shadow: 0px 3px 6px #00000029;
`
const Header = styled.div`
  box-sizing: border-box;
  display: flex;
  background: ${p => p.theme.color.charcoal};
  width: 580px;
  justify-content: space-around;
  padding: 12px;
`

const Title = styled.h1`
  color: ${p => p.theme.color.white};
  font-size: 16px;
  font-weight: normal;
  line-height: 22px;
`

const ButtonGroup = styled.div`
  display: inline-block;
  & > :not(:last-child) {
    margin-right: 16px;
  }
`

const ValidateButton = styled(Button)`
  background: ${p => p.theme.color.mediumSeaGreen};
  border: 1px ${p => p.theme.color.mediumSeaGreen} solid;
  color: ${p => p.theme.color.white};
  &:hover {
    background: ${p => p.theme.color.mediumSeaGreen};
    border: 1px ${p => p.theme.color.mediumSeaGreen} solid;
  }
`
const ButtonRow = styled.div<{ $withCustomTools: boolean }>`
  display: flex;
  justify-content: ${p => (p.$withCustomTools ? 'space-between' : 'flex-end')};
`
const Body = styled.div`
  padding: 24px;
  background-color: ${p => p.theme.color.white};
`
