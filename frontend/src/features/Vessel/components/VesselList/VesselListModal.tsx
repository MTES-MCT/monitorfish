import { StyledModalHeader } from '@features/commonComponents/StyledModalHeader'
import { PrimaryButton, SecondaryButton } from '@features/commonStyles/Buttons.style'
import { DownloadVesselListModal } from '@features/Vessel/components/VesselList/DownloadVesselListModal'
import { VesselIcon } from '@features/Vessel/components/VesselList/index'
import { VesselListFilters } from '@features/Vessel/components/VesselList/VesselListFilters'
import { VesselListTable } from '@features/Vessel/components/VesselList/VesselListTable'
import { vesselSelectors } from '@features/Vessel/slice'
import { previewVessels } from '@features/Vessel/useCases/previewVessels'
import { SaveVesselFiltersModal } from '@features/VesselFilter/components/SaveVesselFiltersModal'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Modal } from 'rsuite'
import styled from 'styled-components'

import { setBlockVesselsUpdate } from '../../../../domain/shared_slices/Global'
import { getFilteredVessels } from '../../../../domain/use_cases/vessel/getFilteredVessels'
import { unselectVessel } from '../../../../domain/use_cases/vessel/unselectVessel'
import { LegacyRsuiteComponentsWrapper } from '../../../../ui/LegacyRsuiteComponentsWrapper'
import PreviewSVG from '../../../icons/Oeil_apercu_carte.svg?react'

import type { VesselEnhancedLastPositionWebGLObject } from '../../../../domain/entities/vessel/types'

const NOT_FOUND = -1

type CheckedVesselEnhancedLastPositionWebGLObject = VesselEnhancedLastPositionWebGLObject & {
  checked?: boolean
}

export function VesselListModal({ namespace, onClose }) {
  const dispatch = useMainAppDispatch()
  const vessels = useMainAppSelector(state => vesselSelectors.selectAll(state.vessel.vessels))

  const firstUpdate = useRef(true)

  useEffect(() => {
    dispatch(unselectVessel())
    firstUpdate.current = false

    dispatch(setBlockVesselsUpdate(true))
    setVessels(vessels as CheckedVesselEnhancedLastPositionWebGLObject[])
    setVesselsCountTotal(vessels?.length || 0)

    return () => {}
  }, [dispatch, vessels])

  const [downloadVesselListModalIsOpen, setDownloadVesselListModalIsOpen] = useState(false)
  const [saveVesselFilterModalIsOpen, setSaveVesselFilterModalIsOpen] = useState(false)
  const [seeMoreIsOpen, setSeeMoreIsOpen] = useState(false)

  const [_vessels, setVessels] = useState<CheckedVesselEnhancedLastPositionWebGLObject[]>([])
  const [filteredVessels, setFilteredVessels] = useState<CheckedVesselEnhancedLastPositionWebGLObject[]>([])
  const [vesselsCountTotal, setVesselsCountTotal] = useState(0)
  const [vesselsCountShowed, setVesselsCountShowed] = useState(0)
  const [allVesselsChecked, setAllVesselsChecked] = useState(true)

  // Filters
  const {
    countriesFiltered,
    districtsFiltered,
    fleetSegmentsFiltered,
    gearsFiltered,
    lastControlMonthsAgo,
    lastPositionTimeAgoFilter,
    speciesFiltered,
    vesselsLocationFilter,
    vesselsSizeValuesChecked,
    zonesSelected
  } = useMainAppSelector(state => state.vesselList)

  const hasNoFilter = () =>
    !lastControlMonthsAgo &&
    !zonesSelected?.length &&
    !countriesFiltered?.length &&
    !fleetSegmentsFiltered?.length &&
    !gearsFiltered?.length &&
    !speciesFiltered?.length &&
    !districtsFiltered?.length &&
    !vesselsSizeValuesChecked?.length &&
    vesselsLocationFilter?.length === 2

  const checkedVessels = useMemo(
    () =>
      _vessels.map(vessel => ({
        ...vessel,
        checked: allVesselsChecked
      })),
    [_vessels, allVesselsChecked]
  )

  useEffect(() => {
    if (checkedVessels?.length) {
      const filters = {
        countriesFiltered,
        districtsFiltered,
        fleetSegmentsFiltered,
        gearsFiltered,
        lastControlMonthsAgo,
        lastPositionTimeAgoFilter,
        speciesFiltered,
        vesselsLocationFilter,
        vesselsSizeValuesChecked,
        zonesSelected
      }

      setTimeout(() => {
        dispatch(getFilteredVessels(checkedVessels, filters)).then(_filteredVessels => {
          const nextVessels = _filteredVessels.map(vessel => ({
            ...vessel,
            flagState: vessel.flagState.toLowerCase()
          }))
          setFilteredVessels(nextVessels)
          setVesselsCountShowed(_filteredVessels.length)
        })
      }, 0)
    }
  }, [
    dispatch,
    checkedVessels,
    countriesFiltered,
    lastPositionTimeAgoFilter,
    zonesSelected,
    fleetSegmentsFiltered,
    gearsFiltered,
    districtsFiltered,
    speciesFiltered,
    vesselsSizeValuesChecked,
    lastControlMonthsAgo,
    vesselsLocationFilter
  ])

  const toggleSelectRow = useCallback(
    (vesselFeatureId, value) => {
      const nextVessels: CheckedVesselEnhancedLastPositionWebGLObject[] = Object.assign([], _vessels)

      const toggledVesselIndex = nextVessels.findIndex(vessel => vessel.vesselFeatureId === vesselFeatureId)
      if (toggledVesselIndex === NOT_FOUND) {
        return
      }

      const vesselWithCheckedUpdated = nextVessels[toggledVesselIndex]
      if (!vesselWithCheckedUpdated) {
        return
      }
      nextVessels.splice(toggledVesselIndex, 1, { ...vesselWithCheckedUpdated, checked: value })
      setVessels(nextVessels)
    },
    [_vessels, setVessels]
  )

  return (
    <>
      <StyledModalHeader $isFull>
        <Modal.Title>
          <VesselIcon $background={THEME.color.charcoal} $isRightMenuShrinked={undefined} $isTitle />
          Liste des navires avec VMS
        </Modal.Title>
      </StyledModalHeader>
      <Modal.Body>
        <LegacyRsuiteComponentsWrapper>
          <Title>FILTRER LA LISTE</Title>
          <VesselListFilters namespace={namespace} seeMoreIsOpen={seeMoreIsOpen} setSeeMoreIsOpen={setSeeMoreIsOpen} />
          <VesselListTable
            allVesselsChecked={allVesselsChecked}
            filteredVessels={filteredVessels}
            seeMoreIsOpen={seeMoreIsOpen}
            setAllVesselsChecked={setAllVesselsChecked}
            toggleSelectRow={toggleSelectRow}
            vesselsCountShowed={vesselsCountShowed}
            vesselsCountTotal={vesselsCountTotal}
          />
        </LegacyRsuiteComponentsWrapper>
      </Modal.Body>
      <Modal.Footer>
        <PreviewButton
          data-cy="preview-filtered-vessels"
          disabled={!(filteredVessels && filteredVessels.length)}
          onClick={() => dispatch(previewVessels(filteredVessels))}
        >
          <Preview />
          Aperçu sur la carte
        </PreviewButton>
        <BlackButton
          $isLast={false}
          data-cy="save-filter-modal"
          disabled={hasNoFilter()}
          onClick={() => setSaveVesselFilterModalIsOpen(true)}
        >
          Enregistrer le filtre
        </BlackButton>
        <BlackButton
          $isLast
          data-cy="download-vessels-modal"
          disabled={!filteredVessels?.some(vessel => vessel.checked)}
          onClick={() => setDownloadVesselListModalIsOpen(true)}
        >
          Télécharger le tableau
        </BlackButton>
      </Modal.Footer>
      <DownloadVesselListModal
        filteredVessels={filteredVessels}
        isOpen={downloadVesselListModalIsOpen}
        setIsOpen={setDownloadVesselListModalIsOpen}
      />
      <SaveVesselFiltersModal
        filters={{
          countriesFiltered,
          districtsFiltered,
          fleetSegmentsFiltered,
          gearsFiltered,
          lastControlMonthsAgo,
          speciesFiltered,
          vesselsSizeValuesChecked,
          zonesSelected
        }}
        isOpen={saveVesselFilterModalIsOpen}
        onClose={onClose}
        setIsOpen={setSaveVesselFilterModalIsOpen}
      />
    </>
  )
}

const PreviewButton = styled(SecondaryButton)`
  float: left;
  margin-left: 25px;
  padding-left: 5px;
`

const BlackButton = styled(PrimaryButton)<{
  $isLast: boolean
}>`
  margin: 20px ${p => (p.$isLast ? '20px' : '0')} 20px 10px;
  font-size: 13px;
  color: ${p => p.theme.color.gainsboro};
`

const Title = styled.div`
  font-size: 16px;
  color: ${p => p.theme.color.slateGray};
  font-weight: 500;
`

const Preview = styled(PreviewSVG)`
  width: 23px;
  margin-right: 8px;
  vertical-align: text-top;
`
