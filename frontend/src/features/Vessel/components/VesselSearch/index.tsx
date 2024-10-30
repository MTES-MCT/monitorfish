import { useClickOutsideWhenOpenedWithinRef } from '@hooks/useClickOutsideWhenOpenedWithinRef'
import { useEscapeFromKeyboard } from '@hooks/useEscapeFromKeyboard'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Icon, IconButton, Link, useFieldControl, useKey } from '@mtes-mct/monitor-ui'
import Fuse from 'fuse.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { VESSEL_SEARCH_OPTIONS } from './constants'
import { enrichWithVesselIdentifierIfNotFound, removeDuplicatedFoundVessels } from './utils'
import { VesselSearchResult } from './VesselSearchResult'
import { searchVessels as searchVesselsAction } from '../../../../domain/use_cases/vessel/searchVessels'
import { showVessel } from '../../../../domain/use_cases/vessel/showVessel'

import type { VesselIdentity } from '../../../../domain/entities/vessel/types'
import type { ChangeEvent, InputHTMLAttributes, MutableRefObject } from 'react'
import type { Promisable } from 'type-fest'

type VesselSearchProps = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
    baseRef?: MutableRefObject<HTMLDivElement | undefined> | undefined
    cachedVesselIdentities?: VesselIdentity[]
    extendedWidth?: number | undefined
    hasError?: boolean | undefined
    isExtended?: boolean | undefined
    isLastSearchedVesselsShowed?: boolean
    isLinkToVesselSidebarDisplayed?: boolean
    isVesselIdRequiredFromResults?: boolean
    onChange: (selectedVessel: VesselIdentity | undefined) => Promisable<void>
    onClickOutsideOrEscape?: () => Promisable<void>
    onInputClick?: () => Promisable<void>
    value?: VesselIdentity | undefined
  }
>
export function VesselSearch({
  baseRef,
  cachedVesselIdentities,
  className,
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
  value,
  ...inputNativeProps
}: VesselSearchProps) {
  const dispatch = useMainAppDispatch()
  const baseUrl = window.location.origin
  const searchQueryRef = useRef('')
  const wrapperRef = useRef(null)

  const [foundVessels, setFoundVessels] = useState<VesselIdentity[]>([])
  const [showLastSearchedVessels, setShowLastSearchedVessels] = useState(false)

  const escapeFromKeyboard = useEscapeFromKeyboard()
  const clickedOutsideComponent = useClickOutsideWhenOpenedWithinRef(wrapperRef, isExtended, baseRef)

  const { controlledOnChange: handleOnChange, controlledValue: selectedVessel } = useFieldControl(value, onChange)

  const key = useKey([selectedVessel])
  const flagState = selectedVessel?.flagState
  const vesselName = selectedVessel?.vesselName ?? undefined

  const clean = useCallback(async () => {
    searchQueryRef.current = ''

    setFoundVessels([])
    setShowLastSearchedVessels(false)

    handleOnChange(undefined)
  }, [handleOnChange])

  const selectVessel = useCallback(
    vesselIdentity => {
      const vesselWithIdentifier = enrichWithVesselIdentifierIfNotFound(vesselIdentity)

      setShowLastSearchedVessels(false)
      setFoundVessels([])

      handleOnChange(vesselWithIdentifier)
    },
    [handleOnChange]
  )

  const onVesselInputClick = useCallback(() => {
    setShowLastSearchedVessels(true)
    onInputClick?.()
  }, [onInputClick])

  const fuse = useMemo(
    () => (cachedVesselIdentities ? new Fuse(cachedVesselIdentities, VESSEL_SEARCH_OPTIONS) : undefined),
    [cachedVesselIdentities]
  )

  const findVessels = useCallback(
    async (searchQuery: string) => {
      const foundVesselIdentitiesFromCache = fuse?.search(searchQuery).map(result => result.item) ?? []

      const foundVesselsFromApi = await dispatch(searchVesselsAction(searchQuery.toUpperCase()))
      if (!foundVesselsFromApi) {
        return isVesselIdRequiredFromResults
          ? foundVesselIdentitiesFromCache.filter(foundVesselIdentity => !!foundVesselIdentity.vesselId)
          : foundVesselIdentitiesFromCache
      }

      const nextFoundVessels = removeDuplicatedFoundVessels(foundVesselsFromApi, foundVesselIdentitiesFromCache)
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
          key={key}
          $baseUrl={baseUrl}
          $flagState={flagState}
          $hasError={hasError}
          data-cy="VesselSearch-input"
          onChange={handleChange}
          onClick={onVesselInputClick}
          placeholder="Rechercher un navire..."
          type="text"
          value={vesselName}
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
        {vesselName && (
          <IconButton
            accent={Accent.TERTIARY}
            disabled={inputNativeProps.disabled}
            Icon={Icon.Close}
            iconSize={14}
            onClick={clean}
          />
        )}
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

  &:disabled {
    background-color: var(--rs-input-disabled-bg);
  }

  &:hover,
  &:focus {
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
