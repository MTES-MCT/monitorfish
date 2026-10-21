import { Accent, Button, Dialog, Select, Textarea, THEME, pluralize } from '@mtes-mct/monitor-ui'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { UploadEmailsFile } from './UploadEmailsFile'
import { EXTERNAL_ADMINISTRATION_AS_OPTIONS } from '../../constants'
import { useReplaceAdministrationUsersMutation } from '../../userManagementApi'
import { getAdministrationEmailsDiff, isValidEmail, parseEmails } from '../../utils'

import type { UserManagement } from '../../types'

type ReplaceAdministrationUsersDialogProps = Readonly<{
  onClose: () => void
  users: UserManagement.User[]
}>
export function ReplaceAdministrationUsersDialog({ onClose, users }: ReplaceAdministrationUsersDialogProps) {
  const [replaceAdministrationUsers, { isLoading }] = useReplaceAdministrationUsersMutation()

  const [administration, setAdministration] = useState<UserManagement.ExternalAdministration | undefined>(undefined)
  const [rawEmails, setRawEmails] = useState<string | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const emails = useMemo(() => parseEmails(rawEmails), [rawEmails])
  const invalidEmails = useMemo(() => emails.filter(email => !isValidEmail(email)), [emails])
  const diff = useMemo(
    () => (administration ? getAdministrationEmailsDiff(users, administration, emails) : undefined),
    [users, administration, emails]
  )
  const canSubmit = administration !== undefined && invalidEmails.length === 0 && !isLoading

  const importEmails = (importedEmails: string[]) => {
    if (importedEmails.length === 0) {
      setErrorMessage('Aucun e-mail n’a été trouvé dans ce fichier.')

      return
    }

    setErrorMessage(undefined)
    setRawEmails(importedEmails.join('\n'))
  }

  const submit = async () => {
    if (!administration) {
      return
    }

    const result = await replaceAdministrationUsers({ administration, emails })
    if ('error' in result) {
      setErrorMessage((result.error as Error).message)

      return
    }

    onClose()
  }

  return (
    <Dialog isAbsolute>
      <Dialog.Title onClose={onClose}>Mettre à jour les utilisateurs d’une administration</Dialog.Title>
      <StyledBody>
        <p>
          Lors de la revue des habilitations, collez ou importez (CSV) la liste complète des e-mails de
          l’administration. Les utilisateurs absents de la liste perdront leur accès.
        </p>
        <Select
          label="Administration"
          name="administration"
          onChange={setAdministration}
          options={EXTERNAL_ADMINISTRATION_AS_OPTIONS}
          value={administration}
        />
        <Textarea
          label="E-mails (un par ligne, ou séparés par des virgules)"
          name="emails"
          onChange={setRawEmails}
          rows={10}
          value={rawEmails}
        />
        <UploadEmailsFile onChange={importEmails} />

        {invalidEmails.length > 0 && (
          <Error>
            {pluralize('E-mail invalide', invalidEmails.length)} : {invalidEmails.join(', ')}
          </Error>
        )}
        {diff && invalidEmails.length === 0 && (
          <Diff data-cy="replace-administration-users-diff">
            <li>
              {diff.addedEmails.length} {pluralize('utilisateur', diff.addedEmails.length)} à ajouter
              {diff.addedEmails.length > 0 && ` : ${diff.addedEmails.join(', ')}`}
            </li>
            <li>
              {diff.removedEmails.length} {pluralize('utilisateur', diff.removedEmails.length)} à supprimer
              {diff.removedEmails.length > 0 && ` : ${diff.removedEmails.join(', ')}`}
            </li>
          </Diff>
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
          Mettre à jour
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
  width: 600px;
`

const Diff = styled.ul`
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  padding-left: 16px;
`

const Error = styled.p`
  color: ${THEME.color.maximumRed};
`
