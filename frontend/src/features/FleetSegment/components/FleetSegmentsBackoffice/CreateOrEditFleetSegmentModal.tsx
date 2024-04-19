import { FLEET_SEGMENT_FORM_SCHEMA } from '@features/FleetSegment/components/FleetSegmentsBackoffice/schema'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Button, FormikMultiSelect, FormikNumberInput, FormikTextInput, THEME } from '@mtes-mct/monitor-ui'
import { Form, Formik } from 'formik'
import { useMemo } from 'react'
import { Footer, Modal } from 'rsuite'
import styled from 'styled-components'

import { StyledModalHeader } from '../../../commonComponents/StyledModalHeader'

import type { FleetSegment, UpdateFleetSegment } from '../../types'

type CreateOrEditFleetSegmentModalProps = Readonly<{
  faoAreasList: any
  onCancel: () => void
  onCreate: (nextFleetSegment: UpdateFleetSegment) => void
  onUpdate: (segment: string, year: number, nextFleetSegment: UpdateFleetSegment) => Promise<void>
  updatedFleetSegment: FleetSegment | undefined
  year: number
}>
export function CreateOrEditFleetSegmentModal({
  faoAreasList,
  onCancel,
  onCreate,
  onUpdate,
  updatedFleetSegment,
  year
}: CreateOrEditFleetSegmentModalProps) {
  const gearsFAOList = useMainAppSelector(state => state.gear.gears)
  const speciesFAOList = useMainAppSelector(state => state.species.species)

  const initialValues = useMemo(() => {
    if (updatedFleetSegment) {
      return updatedFleetSegment
    }

    return {
      bycatchSpecies: [],
      faoAreas: [],
      gears: [],
      impactRiskFactor: undefined,
      segment: undefined,
      segmentName: undefined,
      targetSpecies: [],
      year
    }
  }, [updatedFleetSegment, year])

  const faoSpeciesAsOptions = useMemo(
    () => speciesFAOList.map(species => ({ label: species.code, value: species.code })),
    [speciesFAOList]
  )

  const handleSubmit = nextFleetSegment => {
    if (updatedFleetSegment) {
      onUpdate(updatedFleetSegment.segment, year, nextFleetSegment)

      return
    }

    onCreate(nextFleetSegment)
  }

  return (
    <ModalWithCustomHeight backdrop keyboard={false} onClose={onCancel} open size="xs" style={{ marginTop: 50 }}>
      <StyledModalHeader>
        <Modal.Title>
          <Title>{updatedFleetSegment ? 'Modifier' : 'Ajouter'} un segment de flotte</Title>
        </Modal.Title>
      </StyledModalHeader>
      <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={FLEET_SEGMENT_FORM_SCHEMA}>
        <Form>
          <Body>
            <Columns>
              <Column>
                <FormikTextInput label="Nom" name="segment" />
              </Column>
              <Column>
                <FormikNumberInput label="Note d’impact" name="impactRiskFactor" />
              </Column>
            </Columns>
            <FormikTextInput label="Description" name="segmentName" />
            <FormikMultiSelect
              label="Engins"
              name="gears"
              options={gearsFAOList.map(gear => ({ label: gear.code, value: gear.code }))}
              searchable
              virtualized
            />
            <FormikMultiSelect
              label="Espèces ciblées"
              name="targetSpecies"
              options={faoSpeciesAsOptions}
              searchable
              virtualized
            />
            <FormikMultiSelect
              label="Prises accessoires"
              name="bycatchSpecies"
              options={faoSpeciesAsOptions}
              searchable
              virtualized
            />
            <FormikMultiSelect
              label="Zones FAO"
              name="faoAreas"
              options={faoAreasList?.map(_faoAreas => ({ label: _faoAreas, value: _faoAreas }))}
              searchable
              virtualized
            />
          </Body>
          <Footer>
            <ValidateButton type="submit">{updatedFleetSegment ? 'Modifier' : 'Ajouter'}</ValidateButton>
          </Footer>
        </Form>
      </Formik>
    </ModalWithCustomHeight>
  )
}

const Columns = styled.div`
  display: flex;
`

const Column = styled.div`
  margin-right: 5px;
`

const ValidateButton = styled(Button)`
  margin: 24px 10px 24px 24px;
`

const Title = styled.div`
  color: ${THEME.color.gainsboro};
  font-size: 16px;
  line-height: 30px;
`

const Body = styled(Modal.Body)`
  padding: 6px 24px 0 24px !important;
  overflow: visible !important;

  label {
    margin-top: 12px;
  }
`

const ModalWithCustomHeight = styled(Modal)`
  .rs-modal-content {
    height: inherit !important;
  }
`
