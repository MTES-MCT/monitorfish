import Fuse from 'fuse.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { getOnlyVesselIdentityProperties } from '../../domain/entities/vessel/vessel'
import { searchVessels as searchVesselsAction } from '../../domain/use_cases/vessel/searchVessels'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useClickOutsideWhenOpened } from '../../hooks/useClickOutsideWhenOpened'
import { useEscapeFromKeyboard } from '../../hooks/useEscapeFromKeyboard'
import { VESSEL_SEARCH_OPTIONS } from './constants'
import { addVesselIdentifierToVesselIdentity, removeDuplicatedFoundVessels } from './utils'
import { VesselSearchResult } from './VesselSearchResult'

import type { VesselIdentity } from '../../domain/entities/vessel/types'

export function VesselSearch({ isFocused, onClickOutsideOrEscape, onInputClick, onSelectVessel }) {
  const dispatch = useAppDispatch()

  const { selectedVesselIdentity, vessels } = useAppSelector(state => state.vessel)

  const wrapperRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [foundVessels, setFoundVessels] = useState<VesselIdentity[]>([])
  const [showLastSearchedVessels, setShowLastSearchedVessels] = useState(false)
  const escapeFromKeyboard = useEscapeFromKeyboard()
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, isFocused)

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
    },
    [onSelectVessel]
  )

  useEffect(() => {
    setShowLastSearchedVessels(isFocused)
  }, [isFocused])

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

      setFoundVessels(nextFoundVessels)
      setShowLastSearchedVessels(false)
    }

    searchVessels(searchQuery)
  }, [dispatch, searchQuery, fuse])

  return (
    <RefWrapper ref={wrapperRef}>
      <Input
        ref={input => (selectedVesselIdentity ? input && input.focus() : null)}
        data-cy="vessel-search-input"
        isExtended={isFocused}
        onChange={e => setSearchQuery(e.target.value)}
        onClick={() => onInputClick() && setShowLastSearchedVessels(true)}
        placeholder="Rechercher un navire..."
        type="text"
        value={searchQuery}
      />
      <VesselSearchResult
        foundVessels={foundVessels}
        searchQuery={searchQuery}
        selectVessel={selectVessel}
        showLastSearchedVessels={showLastSearchedVessels}
      />
    </RefWrapper>
  )
}

const RefWrapper = styled.div``

const Input = styled.input<{
  isExtended: boolean
}>`
  margin: 0;
  background-color: white;
  border: none;
  border-radius: 0;
  border-radius: 2px;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  height: 40px;
  width: ${p => (p.isExtended ? 500 : 320)}px;
  padding: 0 5px 0 10px;
  flex: 3;
  transition: all 0.7s;

  :hover,
  :focus {
    border: none;
  }
`
