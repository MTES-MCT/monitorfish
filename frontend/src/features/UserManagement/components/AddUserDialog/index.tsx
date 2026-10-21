import { CNSP_SERVICE_OPTIONS } from '@features/VesselGroup/constants'
import { Accent, Button, Checkbox, Dialog, MultiRadio, Select, TextInput, THEME } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import { EXTERNAL_ADMINISTRATION_AS_OPTIONS, USER_TYPE_AS_OPTIONS } from '../../constants'
import { UserManagement } from '../../types'
import { useAddUserMutation } from '../../userManagementApi'
import { isValidEmail } from '../../utils'

import type { CnspService } from '@features/VesselGroup/types'

type AddUserDialogProps = Readonly<{
  onClose: () => void
  users: UserManagement.User[]
}>
export function AddUserDialog({ onClose, users }: AddUserDialogProps) {
  const [addUser, { isLoading }] = useAddUserMutation()

  const [rawEmail, setRawEmail] = useState<string | undefined>(undefined)
  const [userType, setUserType] = useState<UserManagement.UserType | undefined>(UserManagement.UserType.CNSP)
  const [service, setService] = useState<CnspService | undefined>(undefined)
  const [isAdministrator, setIsAdministrator] = useState(false)
  const [administration, setAdministration] = useState<UserManagement.ExternalAdministration | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const email = rawEmail?.trim().toLowerCase() ?? ''
  const isCnspUser = userType === UserManagement.UserType.CNSP
  const isAlreadyRegistered = users.some(user => user.email === email)
  const emailError = (() => {
    if (!email) {
      return undefined
    }
    if (!isValidEmail(email)) {
      return 'E-mail invalide.'
    }

    return isAlreadyRegistered ? 'Cet utilisateur existe déjà.' : undefined
  })()
  const canSubmit =
    !!email && !emailError && userType !== undefined && (isCnspUser || administration !== undefined) && !isLoading

  const submit = async () => {
    const result = await addUser({
      administration: isCnspUser ? undefined : administration,
      email,
      isAdministrator: isCnspUser && isAdministrator,
      isSuperUser: isCnspUser,
      service: isCnspUser ? service : undefined
    })
    if ('error' in result) {
      setErrorMessage((result.error as Error).message)

      return
    }

    onClose()
  }

  return (
    <Dialog isAbsolute>
      <Dialog.Title onClose={onClose}>Ajouter un utilisateur</Dialog.Title>
      <StyledBody>
        <TextInput error={emailError} isRequired label="E-mail" name="email" onChange={setRawEmail} value={rawEmail} />
        <MultiRadio
          isInline
          isRequired
          label="Type d’utilisateur"
          name="userType"
          onChange={setUserType}
          options={USER_TYPE_AS_OPTIONS}
          value={userType}
        />
        {isCnspUser ? (
          <>
            <Select
              label="Service CNSP"
              name="service"
              onChange={setService}
              options={CNSP_SERVICE_OPTIONS}
              value={service}
            />
            <Checkbox
              checked={isAdministrator}
              label="Administrateur (gestion des utilisateurs)"
              name="isAdministrator"
              onChange={nextValue => setIsAdministrator(!!nextValue)}
            />
          </>
        ) : (
          <Select
            isRequired
            label="Administration"
            name="administration"
            onChange={setAdministration}
            options={EXTERNAL_ADMINISTRATION_AS_OPTIONS}
            value={administration}
          />
        )}
        {errorMessage && <Error>{errorMessage}</Error>}
      </StyledBody>
      <Dialog.Action>
        <Button accent={Accent.SECONDARY} onClick={onClose}>
          Annuler
        </Button>
        <Button
          accent={Accent.PRIMARY}
          disabled={!canSubmit}
          onClick={() => {
            void submit()
          }}
        >
          Ajouter
        </Button>
      </Dialog.Action>
    </Dialog>
  )
}

const StyledBody = styled(Dialog.Body)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 40px;
  text-align: left;
  width: 480px;
`

const Error = styled.p`
  color: ${THEME.color.maximumRed};
`
