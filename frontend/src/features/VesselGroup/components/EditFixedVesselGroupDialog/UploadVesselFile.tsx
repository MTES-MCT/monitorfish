import { getVesselsFromFile } from '@features/VesselGroup/components/EditFixedVesselGroupDialog/utils'
import { Icon } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import { Uploader } from 'rsuite'
import styled from 'styled-components'

import type { VesselIdentityForVesselGroup } from '@features/VesselGroup/types'
import type { FileType } from 'rsuite/esm/Uploader/Uploader'

type UploadVesselFileProps = Readonly<{
  onChange: (vessels: VesselIdentityForVesselGroup[]) => void
  onRemove: () => void
}>
export function UploadVesselFile({ onChange, onRemove }: UploadVesselFileProps) {
  const [isDisabled, setIsDisabled] = useState(false)

  const onUpload = async (fileList: FileType[]) => {
    const fileType = fileList[0]
    if (!fileType) {
      return
    }

    const vessels = await getVesselsFromFile(fileType.blobFile as File)
    onChange(vessels)
    setIsDisabled(true)
  }

  const onRemoveFile = async () => {
    onRemove()
    setIsDisabled(false)
  }

  return (
    <Wrapper>
      <StyledUploader
        action=""
        autoUpload={false}
        disabled={isDisabled}
        draggable
        multiple={false}
        onChange={onUpload}
        onRemove={onRemoveFile}
      >
        <File>
          <Icon.Download size={16} />
          Ajouter une liste de navires
        </File>
      </StyledUploader>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin-top: 16px;

  .rs-uploader-trigger-btn {
    border: 1px dashed #3b4559 !important;
    cursor: pointer;
  }
`
const StyledUploader = styled(Uploader)`
  > .rs-uploader-file-items {
    display: flex;
    .rs-uploader-file-item {
      background-color: ${p => p.theme.color.gainsboro};
      display: flex;
      flex: 1;
      > button {
        display: flex;
        align-items: end;
      }
    }
  }
`
const File = styled.div`
  color: ${p => p.theme.color.charcoal};
  padding: 5px 90px;

  .Element-IconBox {
    vertical-align: bottom;
    margin-right: 4px;
  }
`
