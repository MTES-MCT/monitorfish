import { backofficeProducerOrganizationMembershipActions } from '@features/ProducerOrganizationMembership/backoffice.slice'
import { updateProducerOrganizationMemberships } from '@features/ProducerOrganizationMembership/useCases/updateProducerOrganizationMemberships'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { Button, Icon, Size, TextInput } from '@mtes-mct/monitor-ui'
import { useCallback, useRef, useState } from 'react'
import { Uploader } from 'rsuite'
import styled from 'styled-components'

import type { FileType } from 'rsuite/esm/Uploader/Uploader'

export function FilterBar() {
  const dispatch = useBackofficeAppDispatch()
  const searchQuery = useBackofficeAppSelector(store => store.producerOrganizationMembership.searchQuery)
  const [hasUpdated, setHasUpdated] = useState<boolean>(false)
  const uploader = useRef()

  const onUpload = async (fileList: FileType[]) => {
    const fileType = fileList[0]
    if (!fileType) {
      return
    }

    await dispatch(updateProducerOrganizationMemberships(fileType.blobFile as File))
    setHasUpdated(true)
  }

  const updateSearchQuery = useCallback(
    (nextValue: string | undefined) => {
      dispatch(backofficeProducerOrganizationMembershipActions.setSearchQuery(nextValue))
    },
    [dispatch]
  )

  return (
    <Wrapper>
      <TextInput
        Icon={Icon.Search}
        isLabelHidden
        label="Rechercher..."
        name="searchQuery"
        onChange={updateSearchQuery}
        placeholder="Rechercher..."
        value={searchQuery}
      />

      <Uploader
        ref={uploader}
        action=""
        autoUpload={false}
        draggable
        fileList={[]}
        fileListVisible={false}
        onChange={onUpload}
      >
        {hasUpdated ? (
          <Button Icon={Icon.Check} size={Size.SMALL}>
            Mise-à-jour effectuée
          </Button>
        ) : (
          <Button Icon={Icon.Reset} size={Size.SMALL}>
            Mettre à jour avec une extraction SYSADH
          </Button>
        )}
      </Uploader>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  margin-bottom: 24px;

  .rs-uploader {
    margin-left: 24px;
  }

  .Element-Button {
    color: ${p => p.theme.color.gunMetal};
  }
`
