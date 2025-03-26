import { ConfirmationModal } from '@components/ConfirmationModal'
import { Square } from '@features/Regulation/components/ZonePreview'
import { FilterTags } from '@features/Vessel/components/VesselList/FilterTags'
import { vesselGroupActions } from '@features/VesselGroup/slice'
import { GroupType, Sharing } from '@features/VesselGroup/types'
import { deleteVesselGroup } from '@features/VesselGroup/useCases/deleteVesselGroup'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Icon, IconButton, Tag, THEME } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import type { DynamicVesselGroup } from '@features/VesselGroup/types'

type VesselGroupRowProps = {
  vesselGroup: DynamicVesselGroup
}
export function VesselGroupRow({ vesselGroup }: VesselGroupRowProps) {
  const dispatch = useMainAppDispatch()
  const vesselGroupsIdsDisplayed = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsDisplayed)
  const isDisplayed = vesselGroupsIdsDisplayed.includes(vesselGroup.id)

  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleDeleteVesselGroup = () => {
    dispatch(deleteVesselGroup(vesselGroup.id))
    setIsDeleteConfirmationModalOpen(false)
  }

  return (
    <>
      <Wrapper title={vesselGroup?.name}>
        <Row onClick={() => setIsOpen(!isOpen)}>
          <ChevronIcon $isOpen={isOpen} color={THEME.color.slateGray} />
          <Square $fillColor={vesselGroup.color} $strokeColor={THEME.color.lightGray} />
          {vesselGroup.name}
          <RowIcons>
            {isDisplayed ? (
              <IconButton
                accent={Accent.TERTIARY}
                Icon={Icon.Display}
                iconSize={20}
                onClick={event => {
                  dispatch(vesselGroupActions.vesselGroupIdHidden(vesselGroup.id))
                  event.stopPropagation()
                }}
                title={`Cacher le groupe "${vesselGroup.name}"`}
              />
            ) : (
              <IconButton
                accent={Accent.TERTIARY}
                color={THEME.color.lightGray}
                Icon={Icon.Hide}
                iconSize={20}
                onClick={event => {
                  dispatch(vesselGroupActions.vesselGroupIdDisplayed(vesselGroup.id))
                  event.stopPropagation()
                }}
                title={`Afficher le groupe "${vesselGroup.name}"`}
              />
            )}
          </RowIcons>
        </Row>
        {isOpen && (
          <OpenedGroup>
            <GroupInformation>
              <Description>
                <b>48 navires</b> – {vesselGroup.description}
              </Description>
              {vesselGroup.type === GroupType.DYNAMIC && (
                <StyledTag borderColor={THEME.color.slateGray}>Groupe dynamique</StyledTag>
              )}
              {/**
               vesselGroup.type === GroupType.FIXED && (
               <StyledTag borderColor={THEME.color.slateGray}>Groupe fixe</StyledTag>
               )* */}
              {vesselGroup.sharing === Sharing.PRIVATE && (
                <StyledTag backgroundColor={THEME.color.goldenPoppy25} borderColor={THEME.color.goldenPoppyBorder}>
                  Groupe privé
                </StyledTag>
              )}
              {vesselGroup.sharing === Sharing.SHARED && (
                <StyledTag backgroundColor={THEME.color.goldenPoppy25} borderColor={THEME.color.goldenPoppyBorder}>
                  Groupe partagé
                </StyledTag>
              )}
              <StyledFilterTags isReadOnly listFilterValues={vesselGroup?.filters} />
            </GroupInformation>
            <OpenedGroupIcons>
              <IconButton
                accent={Accent.TERTIARY}
                Icon={Icon.Edit}
                iconSize={20}
                onClick={() => {}}
                title={`Modifier le groupe "${vesselGroup.name}"`}
              />
              <IconButton
                accent={Accent.TERTIARY}
                Icon={Icon.Delete}
                iconSize={20}
                onClick={() => setIsDeleteConfirmationModalOpen(true)}
                title={`Supprimer le groupe "${vesselGroup.name}"`}
              />
            </OpenedGroupIcons>
          </OpenedGroup>
        )}
      </Wrapper>
      {isDeleteConfirmationModalOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Confirmer la suppression"
          message={
            <p>
              <b>Êtes-vous sûr de vouloir supprimer ce groupe de navires ?</b>
            </p>
          }
          onCancel={() => setIsDeleteConfirmationModalOpen(false)}
          onConfirm={handleDeleteVesselGroup}
          title="Supprimer un groupe"
        />
      )}
    </>
  )
}

const StyledFilterTags = styled(FilterTags)`
  margin-top: 16px;
`

const StyledTag = styled(Tag)`
  margin-right: 8px;
`

const Description = styled.p`
  margin-bottom: 8px;
`

const GroupInformation = styled.div`
  margin-right: 4px;
`
const OpenedGroupIcons = styled.div`
  width: 23px;
  .Element-IconButton {
    padding-right: 0;
  }

  .Element-IconButton:not(:first-child) {
    margin-top: 4px;
  }
`

const OpenedGroup = styled.div`
  margin: 0 16px 16px 36px;
  display: flex;
`

const Row = styled.div`
  align-items: center;
  display: flex;
  height: 23px;
  padding: 8px 16px 8px 8px;
  user-select: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
  cursor: pointer;
`

const RowIcons = styled.div`
  margin-left: auto;
  margin-right: 0;
  flex-shrink: 0;
  display: flex;
  height: 36px;
  align-items: center;
  cursor: pointer;

  .Element-IconButton {
    padding-right: 0;
  }
`

const ChevronIcon = styled(Icon.Chevron)<{
  $isOpen: boolean
}>`
  margin-right: 8px;
  transform: rotate(${p => (p.$isOpen ? 180 : 0)}deg);
  transition: all 0.2s ease;
`

const Wrapper = styled.li`
  list-style-type: none;
  margin: 0;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
`
