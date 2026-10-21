import { ConfirmationModal } from '@components/ConfirmationModal'
import { BackOfficeBody } from '@features/BackOffice/components/BackofficeBody'
import { Accent, Button, DataTable, Icon, Select, TextInput, pluralize } from '@mtes-mct/monitor-ui'
import { useContext, useMemo, useState } from 'react'
import styled from 'styled-components'

import { getTableColumns } from './constants'
import { UserAccountContext } from '../../../../context/UserAccountContext'
import { EXTERNAL_ADMINISTRATION_AS_OPTIONS, TAB_LABEL } from '../../constants'
import { UserManagement } from '../../types'
import { useDeleteUserMutation, useGetUsersQuery, useUpdateUserIsAdministratorMutation } from '../../userManagementApi'
import { AddUserDialog } from '../AddUserDialog'
import { AuthorizedOrganizationalUnitList } from '../AuthorizedOrganizationalUnitList'
import { ReplaceAdministrationUsersDialog } from '../ReplaceAdministrationUsersDialog'

const NO_USERS: UserManagement.User[] = []

export function UserTable() {
  const userAccount = useContext(UserAccountContext)
  const { data: users = NO_USERS } = useGetUsersQuery()
  const [deleteUser] = useDeleteUserMutation()
  const [updateUserIsAdministrator] = useUpdateUserIsAdministratorMutation()

  const [selectedTab, setSelectedTab] = useState<UserManagement.Tab>(UserManagement.Tab.USERS)
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const [administrationFilter, setAdministrationFilter] = useState<UserManagement.ExternalAdministration | undefined>(
    undefined
  )
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserManagement.User | undefined>(undefined)

  const columns = useMemo(
    () =>
      getTableColumns(userAccount.email, setUserToDelete, (user, isAdministrator) => {
        void updateUserIsAdministrator({ hashedEmail: user.hashedEmail, isAdministrator })
      }),
    [userAccount.email, updateUserIsAdministrator]
  )
  const filteredUsers = useMemo(() => {
    const normalizedSearchQuery = searchQuery?.trim().toLowerCase()

    return users.filter(
      user =>
        (administrationFilter === undefined || user.administration === administrationFilter) &&
        (!normalizedSearchQuery || (user.email ?? '').includes(normalizedSearchQuery))
    )
  }, [users, administrationFilter, searchQuery])

  const confirmDeletion = async () => {
    if (!userToDelete) {
      return
    }

    await deleteUser(userToDelete.hashedEmail)
    setUserToDelete(undefined)
  }

  return (
    <BackOfficeBody>
      <TabList role="tablist">
        {[UserManagement.Tab.USERS, UserManagement.Tab.AUTHORIZED_ORGANIZATIONAL_UNITS].map(tab => (
          <TabTitle
            key={tab}
            $isSelected={tab === selectedTab}
            aria-selected={tab === selectedTab}
            onClick={() => setSelectedTab(tab)}
            role="tab"
            type="button"
          >
            {TAB_LABEL[tab]}
          </TabTitle>
        ))}
      </TabList>

      {selectedTab === UserManagement.Tab.USERS && (
        <>
          <FilterBar>
            <TextInput
              Icon={Icon.Search}
              isLabelHidden
              label="Rechercher un e-mail"
              name="searchQuery"
              onChange={setSearchQuery}
              placeholder="Rechercher un e-mail..."
              value={searchQuery}
            />
            <Select
              isLabelHidden
              label="Filtrer par administration"
              name="administrationFilter"
              onChange={setAdministrationFilter}
              options={EXTERNAL_ADMINISTRATION_AS_OPTIONS}
              placeholder="Administration"
              value={administrationFilter}
            />
            <Button accent={Accent.SECONDARY} Icon={Icon.Plus} onClick={() => setIsAddDialogOpen(true)}>
              Ajouter un utilisateur
            </Button>
            <Button accent={Accent.PRIMARY} Icon={Icon.Plus} onClick={() => setIsReplaceDialogOpen(true)}>
              Mettre à jour les utilisateurs d’une administration
            </Button>
          </FilterBar>

          <TableLegend data-cy="users-results">
            {filteredUsers.length} {pluralize('utilisateur', filteredUsers.length)}
          </TableLegend>
          <DataTable
            columns={columns}
            data={filteredUsers}
            emptyLabel="Aucun utilisateur ne correspond à cette recherche."
            initialSorting={[{ desc: false, id: 'email' }]}
            tableOptions={{
              getRowId: user => user.hashedEmail
            }}
          />
        </>
      )}

      {selectedTab === UserManagement.Tab.AUTHORIZED_ORGANIZATIONAL_UNITS && <AuthorizedOrganizationalUnitList />}

      {isAddDialogOpen && <AddUserDialog onClose={() => setIsAddDialogOpen(false)} users={users} />}

      {isReplaceDialogOpen && (
        <ReplaceAdministrationUsersDialog onClose={() => setIsReplaceDialogOpen(false)} users={users} />
      )}

      {userToDelete && (
        <ConfirmationModal
          confirmationButtonLabel="Supprimer"
          message={`Êtes-vous sûr de vouloir supprimer l’utilisateur ${userToDelete.email ?? userToDelete.hashedEmail} ?`}
          onCancel={() => setUserToDelete(undefined)}
          onConfirm={confirmDeletion}
          title="Supprimer l’utilisateur"
        />
      )}
    </BackOfficeBody>
  )
}

const TabList = styled.div`
  display: flex;
  gap: 50px;
  margin-bottom: 32px;
`

const TabTitle = styled.button<{
  $isSelected: boolean
}>`
  background: none;
  border: none;
  border-bottom: 5px solid ${p => (p.$isSelected ? p.theme.color.charcoal : 'transparent')};
  color: ${p => p.theme.color.charcoal};
  cursor: pointer;
  font-size: 22px;
  font-weight: 700;
  height: 38px;
  line-height: 1.4;
  padding: 0;
`

const FilterBar = styled.div`
  align-items: center;
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  > .Field-TextInput {
    width: 280px;
  }

  > .Field-Select {
    width: 320px;
  }

  > button:first-of-type {
    margin-left: auto;
  }
`

const TableLegend = styled.p`
  color: ${p => p.theme.color.slateGray};
  line-height: 1;
  margin-bottom: 4px;
`
