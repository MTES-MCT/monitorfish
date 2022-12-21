import Fuse from 'fuse.js'
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { getOnlyVesselIdentityProperties } from '../../domain/entities/vessel/vessel'
import { searchVessels as searchVesselsAction } from '../../domain/use_cases/vessel/searchVessels'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useClickOutsideWhenOpenedWithinRef } from '../../hooks/useClickOutsideWhenOpenedWithinRef'
import { useEscapeFromKeyboard } from '../../hooks/useEscapeFromKeyboard'
import { VESSEL_SEARCH_OPTIONS } from './constants'
import { addVesselIdentifierToVesselIdentity, removeDuplicatedFoundVessels } from './utils'
import { VesselSearchResult } from './VesselSearchResult'

import type { VesselIdentity } from '../../domain/entities/vessel/types'

type VesselSearchProps = {
  baseRef?: RefObject<HTMLDivElement>
  defaultValue?: {
    flagState?: string | null
    vesselName?: string
  }
  extendedWidth: number
  hasVesselIdInResults: boolean
  isExtended: boolean
  isLastSearchedVesselsShowed: boolean
  onClickOutsideOrEscape: () => void
  onInputClick: () => void
  onSelectVessel: (selectedVessel: VesselIdentity) => void
  onUnselectVessel: () => void
}
export function VesselSearch({
  baseRef,
  defaultValue,
  extendedWidth,
  hasVesselIdInResults,
  isExtended,
  isLastSearchedVesselsShowed,
  onClickOutsideOrEscape,
  onInputClick,
  onSelectVessel,
  onUnselectVessel
}: VesselSearchProps) {
  const dispatch = useAppDispatch()
  const baseUrl = useMemo(() => window.location.origin, [])
  const { selectedVesselIdentity, vessels } = useAppSelector(state => state.vessel)

  const wrapperRef = useRef(null)
  const hasSelectedVessel = useRef(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [foundVessels, setFoundVessels] = useState<VesselIdentity[]>([])
  const [showLastSearchedVessels, setShowLastSearchedVessels] = useState(false)
  const escapeFromKeyboard = useEscapeFromKeyboard()
  const clickedOutsideComponent = useClickOutsideWhenOpenedWithinRef(wrapperRef, isExtended, baseRef)

  useEffect(() => {
    if (clickedOutsideComponent || escapeFromKeyboard) {
      onClickOutsideOrEscape()
      setShowLastSearchedVessels(false)
    }
  }, [clickedOutsideComponent, escapeFromKeyboard, onClickOutsideOrEscape])

  const selectVessel = useCallback(
    vesselIdentity => {
      onSelectVessel(vesselIdentity)

      setShowLastSearchedVessels(false)
      setFoundVessels([])
      hasSelectedVessel.current = true
    },
    [onSelectVessel]
  )

  const showedValue = () => {
    if (hasSelectedVessel.current) {
      return defaultValue?.vesselName
    }

    return searchQuery
  }

  useEffect(() => {
    hasSelectedVessel.current = false
    onUnselectVessel()
  }, [onUnselectVessel, searchQuery])

  const onVesselInputClick = useCallback(() => {
    onInputClick()
    setShowLastSearchedVessels(true)
  }, [onInputClick])

  useEffect(() => {
    setShowLastSearchedVessels(isLastSearchedVesselsShowed)
  }, [isLastSearchedVesselsShowed])

  const fuse = useMemo(() => new Fuse(vessels, VESSEL_SEARCH_OPTIONS), [vessels])

  useEffect(() => {
    if (!searchQuery || searchQuery.length <= 1) {
      setFoundVessels([])

      return
    }

    async function searchVessels(_searchQuery) {
      const vesselsFromMap = fuse
        .search(_searchQuery)
        .map(result => getOnlyVesselIdentityProperties(result.item.vesselProperties))

      const nextFoundVesselsFromAPI: VesselIdentity[] = await dispatch(
        searchVesselsAction(_searchQuery.toUpperCase()) as any
      )

      const nextFoundVessels = removeDuplicatedFoundVessels(nextFoundVesselsFromAPI, vesselsFromMap).map(identity =>
        addVesselIdentifierToVesselIdentity(identity)
      )
      const filteredVessels = hasVesselIdInResults
        ? nextFoundVessels.filter(_vessel => _vessel.vesselId)
        : nextFoundVessels

      setFoundVessels(filteredVessels)
      setShowLastSearchedVessels(false)
    }

    searchVessels(searchQuery)
  }, [dispatch, searchQuery, hasVesselIdInResults, fuse])

  return (
    <RefWrapper ref={wrapperRef}>
      <Input
        ref={input => (selectedVesselIdentity ? input && input.focus() : null)}
        baseUrl={baseUrl}
        data-cy="vessel-search-input"
        extendedWidth={extendedWidth}
        flagState={defaultValue?.flagState || ''}
        isExtended={isExtended}
        onChange={e => setSearchQuery(e.target.value)}
        onClick={onVesselInputClick}
        placeholder="Rechercher un navire..."
        type="text"
        value={showedValue()}
      />
      <VesselSearchResult
        foundVessels={foundVessels}
        searchQuery={searchQuery}
        selectVessel={selectVessel}
        showLastSearchedVessels={showLastSearchedVessels}
        width={extendedWidth}
      />
    </RefWrapper>
  )
}

const RefWrapper = styled.div``

const Input = styled.input<{
  baseUrl: string
  extendedWidth: number
  flagState: string
  isExtended: boolean
}>`
  margin: 0;
  border: none;
  border-radius: 0;
  border-radius: 2px;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  height: 40px;
  width: ${p => (p.isExtended ? p.extendedWidth : 320)}px;
  padding: 0 5px 0 10px;
  flex: 3;
  transition: all 0.7s;
  background: ${p =>
    p.flagState ? `url(${p.baseUrl}/flags/${p.flagState.toLowerCase()}.svg) no-repeat scroll, white` : 'white'};
  background-size: 20px;
  background-position-y: center;
  background-position-x: 5px;
  padding-left: ${p => (p.flagState ? 30 : 10)}px;

  :hover,
  :focus {
    border: none;
  }
`
