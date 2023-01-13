import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'
import { noop } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { MissionType } from '../../../domain/types/mission'
import { ActionForm } from './ActionForm'
import { ActionList } from './ActionList'
import { MainForm } from './MainForm'

import type { PartialAction } from './types'
import type { MutableRefObject } from 'react'

export type MissionFormProps = {
  // mission?: Mission
  baseRef: MutableRefObject<HTMLDivElement>
}
export function MissionForm() {
  const headerRef = useRef() as MutableRefObject<HTMLDivElement>
  /** Header height in pixels */
  const [selectedType, setSelectedType] = useState<MissionType>(MissionType.SEA)
  const [headerHeight, setHeaderHeight] = useState<number>(0)
  const [newAction, setNewAction] = useState<PartialAction | undefined>(undefined)

  const unsetNewAction = useCallback(() => {
    setNewAction(undefined)
  }, [])

  const handleResize = useCallback(() => {
    setHeaderHeight(headerRef.current.offsetHeight)
  }, [])

  useEffect(() => {
    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [handleResize])

  return (
    <Wrapper heightOffset={headerHeight}>
      <Header ref={headerRef}>
        <HeaderTitle>Ajout d’une nouvelle mission</HeaderTitle>
        <HeaderButtonGroup>
          <Button accent={Accent.TERTIARY}>Annuler</Button>
          <Button accent={Accent.SECONDARY} Icon={Icon.Save}>
            Enregistrer
          </Button>
          <Button accent={Accent.SECONDARY} Icon={Icon.Confirm}>
            Enregistrer et clôturer
          </Button>
        </HeaderButtonGroup>
      </Header>

      <Body>
        <MainForm onTypeChange={setSelectedType} />
        <ActionList
          actions={[]}
          newAction={newAction}
          onAddAction={setNewAction}
          onDeleteAction={noop}
          onDeleteNewAction={unsetNewAction}
          selectedType={selectedType}
        />
        <ActionForm action={newAction} onChange={setNewAction} />
      </Body>
    </Wrapper>
  )
}

// TODO Check why there is a `box-sizing: revert` in index.css.
const Wrapper = styled.div<{
  // Height offset in pixels
  heightOffset: number
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* TODO Switch to flex sizing once SideWindow is full-flex (and remove the dirty calc). */
  /* flex-grow: 1; */
  height: calc(100% - ${p => p.heightOffset}px + 1rem);
  /* max-height: calc(100% - 47px); */

  * {
    box-sizing: border-box;
  }
`

const Header = styled.div`
  align-items: center;
  background-color: ${p => p.theme.color.white};
  border-bottom: solid 2px ${p => p.theme.color.gainsboro};
  display: flex;
  justify-content: space-between;
  padding: 1.875rem 2rem 1.875rem 3rem;
`

const HeaderTitle = styled.h1`
  color: ${p => p.theme.color.charcoal};
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
`

const HeaderButtonGroup = styled.div`
  display: flex;

  > button:not(:first-child) {
    margin-left: 1rem;
  }
`

const Body = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-grow: 1;
  max-height: calc(100% - 67px);
`
