import { useClickOutsideWhenOpenedWithinRef } from '@hooks/useClickOutsideWhenOpenedWithinRef'
import { useEscapeFromKeyboard } from '@hooks/useEscapeFromKeyboard'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Icon, IconButton, Link } from '@mtes-mct/monitor-ui'
import { undefinedize } from '@utils/undefinedize'
import Fuse from 'fuse.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { VESSEL_SEARCH_OPTIONS } from './constants'
import { enrichWithVesselIdentifierIfNotFound, removeDuplicatedFoundVessels } from './utils'
import { VesselSearchResult } from './VesselSearchResult'
import { getOnlyVesselIdentityProperties } from '../../domain/entities/vessel/vessel'
import { searchVessels as searchVesselsAction } from '../../domain/use_cases/vessel/searchVessels'
import { showVessel } from '../../domain/use_cases/vessel/showVessel'

import type { VesselIdentity } from '../../domain/entities/vessel/types'
import type { ChangeEvent, InputHTMLAttributes, MutableRefObject } from 'react'
import type { Promisable } from 'type-fest'

type VesselSearchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'onChange'> & {
  baseRef?: MutableRefObject<HTMLDivElement | undefined> | undefined
  defaultValue?: VesselIdentity | undefined
  extendedWidth?: number | undefined
  hasError?: boolean | undefined
  isExtended?: boolean | undefined
  isLastSearchedVesselsShowed?: boolean
  isLinkToVesselSidebarDisplayed?: boolean
  isVesselIdRequiredFromResults?: boolean
  onChange: (selectedVessel: VesselIdentity | undefined) => Promisable<void>
  onClickOutsideOrEscape?: () => Promisable<void>
  onInputClick?: () => Promisable<void>
}
export function VesselSearch({
  baseRef,
  className,
  defaultValue,
  extendedWidth,
  hasError,
  isExtended = false,
  isLastSearchedVesselsShowed = false,
  isLinkToVesselSidebarDisplayed = false,
  isVesselIdRequiredFromResults = false,
  onChange,
  onClickOutsideOrEscape,
  onInputClick,
  style,
  ...inputNativeProps
}: VesselSearchProps) {
  const dispatch = useMainAppDispatch()
  const baseUrl = window.location.origin
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const vessels = useMainAppSelector(state => state.vessel.vessels)
  const searchQueryRef = useRef('')
  const wrapperRef = useRef(null)

  const [selectedVessel, setSelectedVessel] = useState<VesselIdentity | undefined>(undefined)
  const [foundVessels, setFoundVessels] = useState<VesselIdentity[]>([])
  const [showLastSearchedVessels, setShowLastSearchedVessels] = useState(false)

  const escapeFromKeyboard = useEscapeFromKeyboard()
  const clickedOutsideComponent = useClickOutsideWhenOpenedWithinRef(wrapperRef, isExtended, baseRef)

  useEffect(() => {
    setSelectedVessel(defaultValue)
  }, [defaultValue, selectedVessel])

  const vesselName = useMemo(
    () => (selectedVessel ? undefinedize(selectedVessel.vesselName) : undefinedize(defaultValue?.vesselName)),
    [defaultValue, selectedVessel]
  )
  const flagState = useMemo(
    () => (selectedVessel ? selectedVessel.flagState : undefinedize(defaultValue?.flagState)),
    [defaultValue, selectedVessel]
  )
  const controlledKey = useMemo(() => vesselName, [vesselName])

  const clean = useCallback(async () => {
    searchQueryRef.current = ''

    setFoundVessels([])
    setShowLastSearchedVessels(false)
    setSelectedVessel(undefined)

    onChange(undefined)
  }, [onChange])

  const selectVessel = useCallback(
    vesselIdentity => {
      const vesselWithIdentifier = enrichWithVesselIdentifierIfNotFound(vesselIdentity)

      setShowLastSearchedVessels(false)
      setFoundVessels([])
      setSelectedVessel(vesselWithIdentifier)

      onChange(vesselWithIdentifier)
    },
    [onChange]
  )

  const onVesselInputClick = useCallback(() => {
    setShowLastSearchedVessels(true)
    onInputClick?.()
  }, [onInputClick])

  const fuse = useMemo(() => new Fuse(vessels, VESSEL_SEARCH_OPTIONS), [vessels])

  const findVessels = useCallback(
    async (searchQuery: string) => {
      const vesselsFromMap = fuse
        .search(searchQuery)
        .map(result => getOnlyVesselIdentityProperties(result.item.vesselProperties))

      const nextFoundVesselsFromAPI = await dispatch(searchVesselsAction(searchQuery.toUpperCase()))
      if (!nextFoundVesselsFromAPI) {
        return isVesselIdRequiredFromResults ? vesselsFromMap.filter(_vessel => _vessel.vesselId) : vesselsFromMap
      }

      const nextFoundVessels = removeDuplicatedFoundVessels(nextFoundVesselsFromAPI, vesselsFromMap)
      const filteredVessels = isVesselIdRequiredFromResults
        ? nextFoundVessels.filter(_vessel => _vessel.vesselId)
        : nextFoundVessels

      return filteredVessels
    },
    [dispatch, isVesselIdRequiredFromResults, fuse]
  )

  const handleChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const searchQuery = event.target.value
      searchQueryRef.current = searchQuery

      if (searchQuery.length <= 1) {
        setFoundVessels([])

        return
      }

      const nextFoundVessels = await findVessels(searchQuery)
      setShowLastSearchedVessels(false)
      setFoundVessels(nextFoundVessels)
    },
    [findVessels]
  )

  useEffect(() => {
    if (!isLastSearchedVesselsShowed) {
      return
    }

    setShowLastSearchedVessels(isLastSearchedVesselsShowed)
  }, [isLastSearchedVesselsShowed])

  // TODO Replace with existing hooks.
  useEffect(() => {
    if (clickedOutsideComponent ?? escapeFromKeyboard) {
      setShowLastSearchedVessels(false)

      onClickOutsideOrEscape?.()
    }
  }, [clickedOutsideComponent, escapeFromKeyboard, onClickOutsideOrEscape])

  function handleShowVessel() {
    if (!selectedVessel) {
      return
    }

    dispatch(showVessel(selectedVessel, false, true))
  }

  return (
    <Wrapper
      ref={wrapperRef}
      $extendedWidth={extendedWidth}
      $isExtended={isExtended}
      className={className}
      style={style}
    >
      <InputWrapper>
        <Input
          key={controlledKey}
          // Disable this behavior when VesselSearch is used within side window
          // (`baseRef` prop is only provided in side window case)
          $baseUrl={baseUrl}
          $flagState={flagState}
          $hasError={hasError}
          autoFocus={!baseRef && !!selectedVesselIdentity}
          data-cy="vessel-search-input"
          defaultValue={vesselName}
          onChange={handleChange}
          onClick={onVesselInputClick}
          placeholder="Rechercher un navire..."
          type="text"
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...inputNativeProps}
        />
        {vesselName && isLinkToVesselSidebarDisplayed && (
          <>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Link
              /* eslint-disable-next-line react/jsx-no-bind */
              onClick={handleShowVessel}
            >
              Voir la fiche
            </Link>
          </>
        )}
        {vesselName && <IconButton accent={Accent.TERTIARY} Icon={Icon.Close} iconSize={14} onClick={clean} />}
      </InputWrapper>
      <VesselSearchResult
        foundVessels={foundVessels}
        searchQuery={searchQueryRef.current}
        selectVessel={selectVessel}
        showLastSearchedVessels={showLastSearchedVessels}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $extendedWidth: number | undefined
  $isExtended: boolean
}>`
  box-sizing: border-box;
  width: ${p => (p.$isExtended && p.$extendedWidth !== undefined ? p.$extendedWidth : 320)}px;
  transition: all 0.7s;

  * {
    box-sizing: border-box;
  }
`

const Input = styled.input<{
  $baseUrl: string
  $flagState: string | undefined
  $hasError: boolean | undefined
}>`
  margin: 0;
  border: ${p => (p.$hasError ? '1px solid red' : 'none')};
  border-radius: 0;
  border-radius: 2px;
  color: ${p => p.theme.color.gunMetal};
  font-size: 13px;
  font-weight: 500;
  height: 40px;
  width: 100%;
  padding: 0 5px 0 10px;
  flex: 3;
  transition: all 0.7s;
  background: ${p =>
    p.$flagState ? `url(${p.$baseUrl}/flags/${p.$flagState.toLowerCase()}.svg) no-repeat scroll, white` : 'white'};
  background-size: 20px;
  background-position-y: center;
  background-position-x: 16px;
  padding-left: ${p => (p.$flagState ? 45 : 16)}px;

  :disabled {
    background-color: var(--rs-input-disabled-bg);
  }

  :hover,
  :focus {
    border: none;
  }
`

const InputWrapper = styled.div`
  position: relative;

  /* Clear icon button */
  > button {
    position: absolute;
    right: 7.5px;
    top: 7.5px;
  }

  /* Open vessel sidebar link */
  > a {
    position: absolute;
    right: 42px;
    top: 11px;
    cursor: pointer;
  }
`
