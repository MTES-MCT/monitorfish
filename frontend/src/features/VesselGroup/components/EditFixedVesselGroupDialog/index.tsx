import { vesselSelectors } from '@features/Vessel/slice'
import { Vessel } from '@features/Vessel/Vessel.types'
import { VesselGroupForm } from '@features/VesselGroup/components/VesselGroupForm'
import { DEFAULT_FIXED_VESSEL_GROUP } from '@features/VesselGroup/constants'
import { type CreateOrUpdateVesselGroup, GroupType } from '@features/VesselGroup/types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Dialog, pluralize } from '@mtes-mct/monitor-ui'
import { type FormikProps } from 'formik'
import { isEqual } from 'lodash-es'
import { type MutableRefObject, useRef } from 'react'
import styled from 'styled-components'

import type { Promisable } from 'type-fest'

type EditFixedVesselGroupDialogProps = {
  editedVesselGroup?: CreateOrUpdateVesselGroup
  onExit: () => Promisable<void>
  vesselFeatureIds: string[]
}
export function EditFixedVesselGroupDialog({
  editedVesselGroup = undefined,
  onExit,
  vesselFeatureIds
}: EditFixedVesselGroupDialogProps) {
  const vessels: Vessel.VesselLastPosition[] = useMainAppSelector(state => {
    const entities = vesselSelectors.selectEntities(state.vessel.vessels)

    return vesselFeatureIds
      .map(id => entities[id])
      .filter((vessel: Vessel.VesselLastPosition | undefined): vessel is Vessel.VesselLastPosition => !!vessel)
  })
  const formRef = useRef<FormikProps<CreateOrUpdateVesselGroup>>()
  const numberOfVessels = vesselFeatureIds.length

  const createOrModifyText =
    !!editedVesselGroup && !isEqual(editedVesselGroup, DEFAULT_FIXED_VESSEL_GROUP) ? 'Modifier' : 'Créer'

  const vesselIdentities = vessels.map(vessel => ({
    cfr: vessel.internalReferenceNumber,
    externalIdentification: vessel.ircs,
    flagState: vessel.flagState,
    ircs: vessel.ircs,
    name: vessel.vesselName,
    vesselId: vessel.vesselId,
    vesselIdentifier: vessel.vesselIdentifier
  }))

  return (
    <StyledDialog isAbsolute>
      <StyledDialogTitle>{createOrModifyText} un groupe de navires fixe</StyledDialogTitle>
      <StyledDialogBody>
        <Row>
          <VesselsCount>
            {numberOfVessels} {pluralize('navire', numberOfVessels)} {pluralize('sélectionné', numberOfVessels)}.
          </VesselsCount>
        </Row>
        <VesselGroupForm
          editedVesselGroup={editedVesselGroup}
          formRef={formRef as MutableRefObject<FormikProps<CreateOrUpdateVesselGroup>>}
          groupType={GroupType.FIXED}
          onExit={onExit}
          vesselIdentities={vesselIdentities}
        />
      </StyledDialogBody>
      <StyledDialogAction>
        <Button
          accent={Accent.PRIMARY}
          disabled={numberOfVessels === 0}
          onClick={() => formRef.current?.handleSubmit()}
        >
          {String(`${createOrModifyText} le groupe`)}
        </Button>
        <Button accent={Accent.TERTIARY} onClick={onExit}>
          Annuler
        </Button>
      </StyledDialogAction>
    </StyledDialog>
  )
}

const StyledDialog = styled(Dialog)`
  > div:last-child {
    min-width: 1224px;
    max-width: 1224px;
  }
`

const VesselsCount = styled.div`
  text-align: left;
  font-weight: 500;
`

const StyledDialogTitle = styled(Dialog.Title)`
  line-height: 48px;
  margin: 0;
`

const StyledDialogAction = styled(Dialog.Action)`
  padding: 24px 8px;
`

const StyledDialogBody = styled(Dialog.Body)`
  padding: 45px 80px;
`

const Row = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
`
