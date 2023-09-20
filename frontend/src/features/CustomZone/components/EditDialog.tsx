import { Accent, Button, Dialog, Icon, TextInput } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import type { Promisable } from 'type-fest'

type EditDialogProps = {
  initialName: string
  onCancel: () => Promisable<void>
  onConfirm: (nextName: string) => Promisable<void>
}
export function EditDialog({ initialName, onCancel, onConfirm }: EditDialogProps) {
  const [name, setName] = useState<string | undefined>(initialName)

  return (
    <Dialog>
      <StyledDialogTitle>Modifier une zone importée</StyledDialogTitle>
      <StyledBody>
        <TextInput label="Nom de la zone" name="custom-zone-name-input" onChange={setName} value={name} />
      </StyledBody>

      <Dialog.Action>
        <Button accent={Accent.TERTIARY} onClick={onCancel}>
          Annuler
        </Button>
        <Button accent={Accent.PRIMARY} disabled={!name} Icon={Icon.Save} onClick={() => name && onConfirm(name)}>
          Enregistrer
        </Button>
      </Dialog.Action>
    </Dialog>
  )
}

// TODO Remove that once we get rid of global legacy CSS.
const StyledDialogTitle = styled(Dialog.Title)`
  line-height: 48px;
  margin: 0;
`

const StyledBody = styled(Dialog.Body)`
  padding: 40px 40px 0px 40px;
`
