import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Icon, IconButton, Link, useClickOutsideEffect, useFieldControl } from '@mtes-mct/monitor-ui'
import Fuse from 'fuse.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { VESSEL_SEARCH_OPTIONS } from './constants'
import { enrichWithVesselIdentifierIfUndefined } from './utils'
import { VesselSearchResult } from './VesselSearchResult'
import { searchVessel } from '../../useCases/searchVessels'

import type { Vessel } from '../../Vessel.types'
import type { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import type { ChangeEvent, InputHTMLAttributes, MutableRefObject } from 'react'
import type { Promisable } from 'type-fest'

export type VesselSearchProps = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'onChange' | 'value'> & {
    baseRef?: MutableRefObject<HTMLDivElement | undefined> | undefined
    displayedErrorKey: DisplayedErrorKey
    hasError?: boolean | undefined
    isVesselIdRequiredFromResults?: boolean
    onBlur?: () => Promisable<void>
    onChange: (nextVessel: Vessel.VesselIdentity | undefined) => Promisable<void>
    onFocus?: () => Promisable<void>
    onVesselLinkClick?: (vessel: Vessel.VesselIdentity) => Promisable<void>
    shouldCloseOnClickOutside?: boolean
    shouldResetSelectedVesselOnChange?: boolean
    value?: Vessel.VesselIdentity | undefined
    vesselIdentitiesFromLastPositions?: Vessel.VesselIdentity[]
    withLastSearchResults?: boolean
  }
>

export function VesselSearch({
  baseRef,
  className,
  displayedErrorKey,
  hasError,
  isVesselIdRequiredFromResults = false,
  onBlur,
  onChange,
  onFocus,
  onVesselLinkClick,
  shouldCloseOnClickOutside,
  shouldResetSelectedVesselOnChange = false,
  style,
  value,
  vesselIdentitiesFromLastPositions,
  withLastSearchResults = false,
  ...inputNativeProps
}: VesselSearchProps) {
  const { controlledOnChange: handleOnChange, controlledValue: selectedVessel } = useFieldControl(value, onChange)

  const flagState = selectedVessel?.flagState
  const vesselName = selectedVessel?.vesselName ?? undefined

  const dispatch = useMainAppDispatch()
  const baseUrl = window.location.origin
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  const [foundVessels, setFoundVessels] = useState<Vessel.VesselIdentity[]>([])
  const [inputValue, setInputValue] = useState(selectedVessel?.vesselName ?? '')
  const [isOpen, setIsOpen] = useState(false)

  const fuse = useMemo(
    () =>
      vesselIdentitiesFromLastPositions
        ? new Fuse(vesselIdentitiesFromLastPositions, VESSEL_SEARCH_OPTIONS)
        : undefined,
    [vesselIdentitiesFromLastPositions]
  )

  const clean = useCallback(async () => {
    setFoundVessels([])
    setInputValue('')
    setIsOpen(false)

    handleOnChange(undefined)
  }, [handleOnChange])

  const selectVessel = useCallback(
    (vesselIdentity: Vessel.VesselIdentity) => {
      const vesselWithIdentifier = enrichWithVesselIdentifierIfUndefined(vesselIdentity)

      setIsOpen(false)

      if (shouldResetSelectedVesselOnChange) {
        onChange(vesselWithIdentifier)
        setInputValue('')
      } else {
        handleOnChange(vesselWithIdentifier)
      }
    },
    [onChange, handleOnChange, shouldResetSelectedVesselOnChange]
  )

  const handleChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const searchQuery = event.target.value

      setInputValue(searchQuery)

      if (searchQuery.length <= 1) {
        setFoundVessels([])

        return
      }

      const nextFoundVessels = await dispatch(
        searchVessel(searchQuery, isVesselIdRequiredFromResults, fuse, displayedErrorKey)
      )

      setFoundVessels(nextFoundVessels)
    },
    [dispatch, displayedErrorKey, fuse, isVesselIdRequiredFromResults]
  )

  const handleClickOutside = useCallback(() => {
    if (!shouldCloseOnClickOutside) {
      return
    }

    setIsOpen(false)

    onBlur?.()
  }, [onBlur, shouldCloseOnClickOutside])

  const handleFocus = () => {
    setIsOpen(true)

    onFocus?.()
  }

  const handleShowVessel = () => {
    if (!selectedVessel || !onVesselLinkClick) {
      return
    }

    onVesselLinkClick(selectedVessel)
  }

  useEffect(() => {
    setInputValue(selectedVessel?.vesselName ?? '')
  }, [selectedVessel])

  useClickOutsideEffect(wrapperRef, handleClickOutside, baseRef?.current)

  return (
    <Wrapper ref={wrapperRef} className={className} style={style}>
      <InputWrapper>
        <Input
          ref={inputRef}
          $baseUrl={baseUrl}
          $flagState={flagState}
          $hasError={hasError}
          data-cy="VesselSearch-input"
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="Rechercher un navire..."
          type="text"
          value={inputValue}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...inputNativeProps}
        />
        {selectedVessel && onVesselLinkClick && (
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
            aria-label="Vider le champ"
            disabled={inputNativeProps.disabled}
            Icon={Icon.Close}
            iconSize={14}
            onClick={clean}
          />
        )}
      </InputWrapper>
      {isOpen && (
        <VesselSearchResult
          foundVessels={foundVessels}
          onSelect={selectVessel}
          searchQuery={inputValue}
          withLastSearchResults={withLastSearchResults}
        />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  box-sizing: border-box;
  transition: all 0.7s;
  position: relative;
  width: 320px;

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
  border-radius: 2px;
  color: ${p => p.theme.color.gunMetal};
  font-size: 13px;
  font-weight: 500;
  height: 40px;
  width: 100%;
  flex: 3;
  background: ${p =>
    p.$flagState ? `url(${p.$baseUrl}/flags/${p.$flagState.toLowerCase()}.svg) no-repeat scroll, white` : 'white'};
  background-size: 20px;
  background-position-y: center;
  background-position-x: 16px;
  padding: 0 5px 0 ${p => (p.$flagState ? 45 : 16)}px;

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
    right: 12px;
    top: 13px;
  }

  /* Open vessel sidebar link */

  > a {
    position: absolute;
    right: 42px;
    top: 11px;
    cursor: pointer;
  }
`
