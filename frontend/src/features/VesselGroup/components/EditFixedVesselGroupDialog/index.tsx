import { vesselSelectors } from '@features/Vessel/slice'
import { Vessel } from '@features/Vessel/Vessel.types'
import { UploadVesselFile } from '@features/VesselGroup/components/EditFixedVesselGroupDialog/UploadVesselFile'
import { VesselGroupForm } from '@features/VesselGroup/components/VesselGroupForm'
import { DEFAULT_FIXED_VESSEL_GROUP } from '@features/VesselGroup/constants'
import {
  type CreateOrUpdateFixedVesselGroup,
  type CreateOrUpdateVesselGroup,
  GroupType,
  type VesselIdentityForVesselGroup
} from '@features/VesselGroup/types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Dialog, Icon, Link, pluralize } from '@mtes-mct/monitor-ui'
import { type FormikProps } from 'formik'
import { isEqual } from 'lodash-es'
import { type MutableRefObject, useRef, useState } from 'react'
import styled from 'styled-components'

import type { Promisable } from 'type-fest'

type EditFixedVesselGroupDialogProps = {
  editedVesselGroup?: CreateOrUpdateVesselGroup
  onExit: () => Promisable<void>
  selectedVesselFeatureIds?: string[]
}
export function EditFixedVesselGroupDialog({
  editedVesselGroup = undefined,
  onExit,
  selectedVesselFeatureIds
}: EditFixedVesselGroupDialogProps) {
  const formRef = useRef<FormikProps<CreateOrUpdateVesselGroup>>()

  const selectedVessels: Vessel.VesselLastPosition[] = useMainAppSelector(state => {
    const entities = vesselSelectors.selectEntities(state.vessel.vessels)

    return (
      selectedVesselFeatureIds
        ?.map(id => entities[id])
        ?.filter((vessel: Vessel.VesselLastPosition | undefined): vessel is Vessel.VesselLastPosition => !!vessel) ?? []
    )
  })
  const selectedVesselIdentities = (function () {
    if (editedVesselGroup) {
      return (editedVesselGroup as CreateOrUpdateFixedVesselGroup).vessels
    }

    return selectedVessels.map(vessel => ({
      cfr: vessel.internalReferenceNumber,
      externalIdentification: vessel.ircs,
      flagState: vessel.flagState,
      ircs: vessel.ircs,
      name: vessel.vesselName,
      vesselId: vessel.vesselId,
      vesselIdentifier: vessel.vesselIdentifier
    }))
  })()

  const [uploadedVessels, setUploadedVessels] = useState<VesselIdentityForVesselGroup[]>([])

  const createOrModifyText =
    !!editedVesselGroup && !isEqual(editedVesselGroup, DEFAULT_FIXED_VESSEL_GROUP) ? 'Modifier' : 'Créer'

  // @ts-ignore All properties of `VesselIdentityForVesselGroup` are seen as optional, even if they are not defined as optional
  const vesselsIdentities = selectedVesselIdentities.concat(uploadedVessels)
  const numberOfVessels = vesselsIdentities.length
  const baseUrl = window.location.origin

  return (
    <StyledDialog isAbsolute>
      <StyledDialogTitle>{createOrModifyText} un groupe de navires fixe</StyledDialogTitle>
      <StyledDialogBody>
        <Row>
          <VesselsCount>
            {numberOfVessels} {pluralize('navire', numberOfVessels)} {pluralize('sélectionné', numberOfVessels)}.
          </VesselsCount>
          <Example>
            Vous pouvez ajouter des navires après avoir créé le groupe, et/ou charger une liste de navires ci-dessous{' '}
            <br />(<Link href={`${baseUrl}/public/examples/navires_groupe_fixe.csv`}>cliquez ici</Link> pour télécharger
            un exemple de tableau au bon format).{' '}
            <Icon.Info
              size={17}
              title="Un champ CFR, Call Sign ou Marquage externe doit à minima être renseigné pour chaque navire."
            />
          </Example>
          <UploadVesselFile onChange={nextVessels => setUploadedVessels(nextVessels)} />
        </Row>
        <VesselGroupForm
          editedVesselGroup={editedVesselGroup}
          formRef={formRef as MutableRefObject<FormikProps<CreateOrUpdateVesselGroup>>}
          groupType={GroupType.FIXED}
          onExit={onExit}
          vesselIdentities={vesselsIdentities}
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

const Example = styled.div`
  text-align: left;
  color: ${p => p.theme.color.slateGray};
  font-style: italic;

  span {
    vertical-align: bottom;
  }
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
  margin-bottom: 16px;
`
