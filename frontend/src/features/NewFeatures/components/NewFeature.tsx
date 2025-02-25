import { checkFeature } from '@features/NewFeatures/slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Link, Tag, THEME } from '@mtes-mct/monitor-ui'
import { sha256 } from '@utils/sha256'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { type MonitorFishFeature } from '../types'

export type NewFeatureProps = {
  date: string
  feature: MonitorFishFeature
  isDateDisplayed: boolean
  isFirstItem: boolean
}
export function NewFeature({ date, feature, isDateDisplayed, isFirstItem }: NewFeatureProps) {
  const dispatch = useMainAppDispatch()
  const checkedFeatures = useMainAppSelector(state => state.newFeatures.checkedFeatures)
  const [isOpened, setIsOpened] = useState(false)
  const [hash, setHash] = useState<string | undefined>(undefined)

  useEffect(() => {
    async function computeHash() {
      const fullHash = await sha256(feature.date + feature.title)
      setHash(fullHash.substring(0, 8))
    }

    computeHash()
  }, [feature])

  const isChecked = !!checkedFeatures.length && !!hash && checkedFeatures.indexOf(hash) !== -1

  const typeTag = (function () {
    switch (feature.type) {
      case 'IMPROVEMENT':
        return (
          <Tag backgroundColor={THEME.color.blueGray25} color={THEME.color.gunMetal}>
            Amélioration
          </Tag>
        )
      case 'NEW_FEATURE':
        return (
          <Tag backgroundColor={THEME.color.mediumSeaGreen25} color={THEME.color.gunMetal}>
            Nouveauté
          </Tag>
        )
      default:
        return ''
    }
  })()

  const toggleOpen = () => {
    if (!isChecked && !!hash) {
      dispatch(checkFeature(hash))
    }

    setIsOpened(!isOpened)
  }

  return (
    <Wrapper key={feature.title + feature.title}>
      <DateSeparator $isFirst={isFirstItem}>
        <Line />
        {isDateDisplayed && <Date>{date}</Date>}
      </DateSeparator>
      <Content onClick={toggleOpen}>
        <VerticalBar $isChecked={isChecked} />
        <Header>
          <Title>{feature.title}</Title>
          <HeaderBottom>
            {typeTag}
            {!isOpened && (
              <>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <StyledLink>Voir plus d&apos;infos</StyledLink>
              </>
            )}
          </HeaderBottom>
          {isOpened && (
            <Body>
              {feature.description}
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <StyledLink $isCloseLink>Voir moins d&apos;infos</StyledLink>
            </Body>
          )}
        </Header>
      </Content>
    </Wrapper>
  )
}

const StyledLink = styled(Link)<{
  $isCloseLink?: boolean
}>`
  cursor: pointer;
  margin-left: auto;
  display: ${p => (p.$isCloseLink ? 'block' : 'inline-block')};
  width: ${p => (p.$isCloseLink ? '115px' : 'unset')};
`

const Wrapper = styled.div``
const Content = styled.div`
  display: flex;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: ${p => p.theme.color.aliceBlue};
  }
`

const Header = styled.div`
  padding-left: 8px;
  padding-right: 12px;
  padding-bottom: 12px;
  width: 100%;
`

const HeaderBottom = styled.div`
  display: flex;
  width: 100%;
`

const Title = styled.div`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
  margin-top: 12px;
  margin-bottom: 12px;
`

const Body = styled.div`
  margin-top: 8px;
`

const VerticalBar = styled.span<{
  $isChecked: boolean
}>`
  background-color: ${p => (p.$isChecked ? 'unset' : p.theme.color.blueGray)};
  width: 4px;
  margin: 2px;
  flex-shrink: 0;
`

const DateSeparator = styled.div<{
  $isFirst: boolean
}>`
  margin-top: ${p => (p.$isFirst ? 10 : 0)}px;
  height: 1px;
  z-index: 999;
`

const Date = styled.div`
  background-color: ${p => p.theme.color.white};
  color: ${p => p.theme.color.slateGray};
  width: 96px;
  margin-top: -8px;
  line-height: 12px;
  margin-left: calc(50% - 48px);
  text-align: center;
`

const Line = styled.div`
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  width: 100%;
`
