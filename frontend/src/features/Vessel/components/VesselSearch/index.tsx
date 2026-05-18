import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Icon, IconButton, Link, useClickOutsideEffect, useFieldControl } from '@mtes-mct/monitor-ui'
import Fuse from 'fuse.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { AIS_VESSEL_SEARCH_OPTIONS, VESSEL_SEARCH_OPTIONS } from './constants'
import { enrichWithVesselIdentifierIfUndefined } from './utils'
import { VesselSearchResult } from './VesselSearchResult'
import { searchVessel } from '../../useCases/searchVessels'

import type { AISVessel } from '../../AISVessel.types'
import type { Vessel } from '../../Vessel.types'
import type { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import type { ChangeEvent, InputHTMLAttributes, MutableRefObject } from 'react'
import type { Promisable } from 'type-fest'

export type VesselSearchProps = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'onChange' | 'value'> & {
    aisVessels?: AISVessel.AISVessel[] | undefined
    baseRef?: MutableRefObject<HTMLDivElement | undefined> | undefined
    displayedErrorKey?: DisplayedErrorKey | undefined
    extendedWidth?: number | undefined
    hasError?: boolean | undefined
    isExtended?: boolean | undefined
    isVesselIdRequiredFromResults?: boolean
    onBlur?: () => Promisable<void>
    onChange: (nextVessel: Vessel.VesselIdentity | AISVessel.AISVessel | undefined, isAIS?: boolean) => Promisable<void>
    onFocus?: () => Promisable<void>
    onVesselLinkClick?: (vessel: Vessel.VesselIdentity) => Promisable<void>
    shouldCloseOnClickOutside?: boolean
    shouldResetInputOnBlur?: boolean | undefined
    shouldResetSelectedVesselOnChange?: boolean
    value?: Vessel.VesselIdentity | undefined
    vmsVessels?: Vessel.VesselIdentity[]
    withLastSearchResults?: boolean
  }
>

export function VesselSearch({
  aisVessels,
  baseRef,
  className,
  displayedErrorKey = undefined,
  extendedWidth,
  hasError,
  isExtended = false,
  isVesselIdRequiredFromResults = false,
  onBlur,
  onChange,
  onFocus,
  onVesselLinkClick,
  shouldCloseOnClickOutside,
  shouldResetInputOnBlur = false,
  shouldResetSelectedVesselOnChange = false,
  style,
  value,
  vmsVessels,
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

  const [foundVessels, setFoundVMSOrReferentialVessels] = useState<Vessel.VesselIdentity[]>([])
  const [inputValue, setInputValue] = useState(selectedVessel?.vesselName ?? '')
  const [isOpen, setIsOpen] = useState(false)

  const vmsVesselsFuse = useMemo(
    () => (vmsVessels ? new Fuse(vmsVessels, VESSEL_SEARCH_OPTIONS) : undefined),
    [vmsVessels]
  )
  const aisVesselsFuse = useMemo(
    () => (aisVessels ? new Fuse(aisVessels, AIS_VESSEL_SEARCH_OPTIONS) : undefined),
    [aisVessels]
  )

  const [foundAISVessels, setFoundAISVessels] = useState<AISVessel.AISVessel[]>([])

  const selectAISVessel = useCallback(
    (aisVessel: AISVessel.AISVessel) => {
      setFoundAISVessels([])
      setFoundVMSOrReferentialVessels([])
      setInputValue('')
      setIsOpen(false)
      onChange(aisVessel, true)
    },
    [onChange]
  )

  const selectVMSVessel = useCallback(
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

  const clean = useCallback(async () => {
    setFoundVMSOrReferentialVessels([])
    setFoundAISVessels([])
    setInputValue('')
    setIsOpen(false)

    handleOnChange(undefined)
  }, [handleOnChange])

  const runSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (searchQuery.length <= 1) {
      setFoundVMSOrReferentialVessels([])
      setFoundAISVessels([])

      return
    }

    const nextFoundVessels = await dispatch(
      searchVessel(searchQuery, isVesselIdRequiredFromResults, vmsVesselsFuse, displayedErrorKey)
    )

    setFoundVMSOrReferentialVessels(nextFoundVessels)
    setFoundAISVessels(aisVesselsFuse ? aisVesselsFuse.search(searchQuery, { limit: 10 }).map(r => r.item) : [])
  }, 200)

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const searchQuery = event.target.value
      setInputValue(searchQuery)
      runSearch(searchQuery)
    },
    [runSearch]
  )

  const handleClickOutside = useCallback(() => {
    if (!shouldCloseOnClickOutside) {
      return
    }

    setIsOpen(false)

    if (shouldResetInputOnBlur) {
      setInputValue('')
      setFoundVMSOrReferentialVessels([])
      setFoundAISVessels([])
    }

    onBlur?.()
  }, [onBlur, shouldCloseOnClickOutside, shouldResetInputOnBlur])

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
    <Wrapper
      ref={wrapperRef}
      $extendedWidth={extendedWidth}
      $isExtended={isExtended}
      className={className}
      style={style}
    >
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
          foundAISVessels={foundAISVessels}
          foundVMSOrReferentialVessels={foundVessels}
          onAISVesselSelect={selectAISVessel}
          onVMSOrReferentialVesselSelect={selectVMSVessel}
          searchQuery={inputValue}
          withLastSearchResults={withLastSearchResults}
        />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $extendedWidth: number | undefined
  $isExtended: boolean
}>`
  box-sizing: border-box;
  transition: all 0.7s;
  position: relative;
  width: ${p => (p.$isExtended && p.$extendedWidth !== undefined ? p.$extendedWidth : 320)}px;

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
