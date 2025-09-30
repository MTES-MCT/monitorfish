import { Criteria } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/shared/Criteria'
import { VesselSearch } from '@features/Vessel/components/VesselSearch'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { Vessel } from '@features/Vessel/Vessel.types'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Accent, Icon, IconButton, useNewWindow } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useField } from 'formik'
import { useState } from 'react'
import styled from 'styled-components'

import type { EditedAlertSpecification } from '@features/Alert/types'

const baseUrl = window.location.origin

type VesselCriteriaProps = {
  onDelete: () => void
  vessels: Vessel.VesselIdentity[]
}
export function VesselCriteria({ onDelete, vessels }: VesselCriteriaProps) {
  const { newWindowContainerRef } = useNewWindow()
  const [input, , helper] = useField<EditedAlertSpecification['vesselIds']>('vesselIds')
  const [isCriteriaOpened, setIsCriteriaOpened] = useState(true)
  const [updatedVessels, setUpdatedVessels] = useState<Vessel.VesselIdentity[]>(vessels)

  const add = (nextVessel: Vessel.VesselIdentity | undefined) => {
    assertNotNullish(nextVessel?.vesselId)

    helper.setValue(input.value.concat(nextVessel?.vesselId))
    setUpdatedVessels(previousVessels => previousVessels.concat(nextVessel))
  }

  const handleDeleteCriteria = () => {
    helper.setValue([])
    onDelete()
  }

  const handleDeleteVessel = (deletedId: number) => {
    helper.setValue(input.value.filter(id => id !== deletedId))
    setUpdatedVessels(previousVessels =>
      previousVessels.filter(previousVessel => previousVessel.vesselId !== deletedId)
    )
  }

  return (
    <Criteria.Wrapper>
      <Criteria.Head
        onClick={() => {
          setIsCriteriaOpened(!isCriteriaOpened)
        }}
        type="button"
      >
        <Criteria.Title>NAVIRES</Criteria.Title>
        <Criteria.ChevronIcon $isOpen={isCriteriaOpened} />
      </Criteria.Head>
      <Criteria.Body $isOpen={isCriteriaOpened}>
        <StyledCriteriaInfo>Seuls les navires émettant VMS peuvent faire l’objet d’une alerte.</StyledCriteriaInfo>
        {updatedVessels.map(vessel => {
          const identifiers = [
            vessel.internalReferenceNumber ? { label: '(CFR)', value: vessel.internalReferenceNumber } : null,
            vessel.mmsi ? { label: '(MMSI)', value: vessel.mmsi } : null,
            vessel.externalReferenceNumber ? { label: '(Marq. ext.)', value: vessel.externalReferenceNumber } : null,
            vessel.ircs ? { label: '(Call Sign)', value: vessel.ircs } : null
          ].filter(Boolean)

          return (
            <VesselRow key={getVesselCompositeIdentifier(vessel)}>
              <VesselColumn>
                <Flag src={`${baseUrl}/flags/${vessel.flagState.toLowerCase()}.svg`} />
                {vessel.vesselName}
                {identifiers.length > 0 && (
                  <VesselInfo>
                    {identifiers.map((id, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <span key={index}>
                        {index > 0 && ' - '}
                        <IdentifierValue>{id!.value}</IdentifierValue> <IdentifierLabel>{id!.label}</IdentifierLabel>
                      </span>
                    ))}
                  </VesselInfo>
                )}
              </VesselColumn>
              <DeleteColumn>
                <IconButton
                  accent={Accent.TERTIARY}
                  Icon={Icon.Delete}
                  onClick={() => handleDeleteVessel(vessel.vesselId!!)}
                  title="Supprimer le navire"
                />
              </DeleteColumn>
            </VesselRow>
          )
        })}
        <StyledVesselSearch
          baseRef={newWindowContainerRef}
          disabled={false}
          displayedErrorKey={DisplayedErrorKey.SIDE_WINDOW_ALERT_MANAGEMENT_ERROR}
          isVesselIdRequiredFromResults
          onChange={add}
          shouldCloseOnClickOutside
          shouldResetSelectedVesselOnChange
        />
        <Criteria.Delete onClick={handleDeleteCriteria} />
      </Criteria.Body>
    </Criteria.Wrapper>
  )
}

const StyledCriteriaInfo = styled(Criteria.Info)`
  margin-bottom: 16px;
`

const Flag = styled.img`
  display: inline-block;
  height: 14px;
  margin-right: 8px;
  vertical-align: middle;
`

const VesselRow = styled.div`
  max-width: inherit;
  display: flex;
  flex-direction: row;
  min-height: 58px;
  border-top: 1px solid ${p => p.theme.color.white};
`

const VesselColumn = styled.div`
  background: ${p => p.theme.color.gainsboro};
  padding: 9px 16px;
  border-right: 1px solid ${p => p.theme.color.white};
  flex-grow: 1;
  min-width: 0;
`

const VesselInfo = styled.div`
  font-size: 13px;
  margin-top: 4px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

const IdentifierValue = styled.span`
  color: ${p => p.theme.color.gunMetal};
`

const IdentifierLabel = styled.span`
  color: ${p => p.theme.color.slateGray};
`

const DeleteColumn = styled.div`
  padding: 9px 16px;
  background: ${p => p.theme.color.gainsboro};

  button {
    margin-top: 8px;
  }
`

const StyledVesselSearch = styled(VesselSearch)`
  margin-top: 16px;
  border: solid 1px ${p => p.theme.color.lightGray};
  width: 100%;

  > div:nth-child(2) {
    border: solid 1px ${p => p.theme.color.lightGray};
    width: 100%;
  }
`
