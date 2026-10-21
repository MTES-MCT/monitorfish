import { ConfirmationModal } from '@components/ConfirmationModal'
import { BackOfficeBody } from '@features/BackOffice/components/BackofficeBody'
import { BackOfficeHeader } from '@features/BackOffice/components/BackOfficeHeader'
import { Accent, Button, DataTable, Icon, Select, TextInput, pluralize } from '@mtes-mct/monitor-ui'
import { useContext, useMemo, useState } from 'react'
import styled from 'styled-components'

import { getTableColumns } from './constants'
import { UserAccountContext } from '../../../../context/UserAccountContext'
import {
  ACTIVITY_AS_OPTIONS,
  EXTERNAL_ADMINISTRATION_AS_OPTIONS,
  TAB_AS_OPTIONS,
  USER_TYPE_AS_OPTIONS
} from '../../constants'
import { UserManagement } from '../../types'
import { useDeleteUserMutation, useGetUsersQuery, useUpdateUserIsAdministratorMutation } from '../../userManagementApi'
import { filterUsers } from '../../utils'
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
  const [filters, setFilters] = useState<UserManagement.Filters>({
    activity: undefined,
    administration: undefined,
    searchQuery: undefined,
    userType: undefined
  })
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
  const filteredUsers = useMemo(() => filterUsers(users, filters), [users, filters])

  const updateFilter =
    <K extends keyof UserManagement.Filters>(key: K) =>
    (nextValue: UserManagement.Filters[K]) =>
      setFilters(previousFilters => ({ ...previousFilters, [key]: nextValue }))

  const confirmDeletion = async () => {
    if (!userToDelete) {
      return
    }

    await deleteUser(userToDelete.hashedEmail)
    setUserToDelete(undefined)
  }

  return (
    <BackOfficeBody>
      <BackOfficeHeader tabs={{ onChange: setSelectedTab, options: TAB_AS_OPTIONS, value: selectedTab }} />

      {selectedTab === UserManagement.Tab.USERS && (
        <>
          <Toolbar>
            <Filters>
              <TextInput
                Icon={Icon.Search}
                isLabelHidden
                label="Rechercher un e-mail"
                name="searchQuery"
                onChange={updateFilter('searchQuery')}
                placeholder="Rechercher un e-mail..."
                value={filters.searchQuery}
              />
              <Select
                isLabelHidden
                label="Filtrer par type"
                name="userTypeFilter"
                onChange={updateFilter('userType')}
                options={USER_TYPE_AS_OPTIONS}
                placeholder="Type"
                value={filters.userType}
              />
              <Select
                isLabelHidden
                label="Filtrer par administration"
                name="administrationFilter"
                onChange={updateFilter('administration')}
                options={EXTERNAL_ADMINISTRATION_AS_OPTIONS}
                placeholder="Administration"
                value={filters.administration}
              />
              <Select
                isLabelHidden
                label="Filtrer par activité"
                name="activityFilter"
                onChange={updateFilter('activity')}
                options={ACTIVITY_AS_OPTIONS}
                placeholder="Activité"
                value={filters.activity}
              />
            </Filters>
            <Actions>
              <Button accent={Accent.SECONDARY} Icon={Icon.Plus} onClick={() => setIsAddDialogOpen(true)}>
                Ajouter un utilisateur
              </Button>
              <Button accent={Accent.PRIMARY} Icon={Icon.Download} onClick={() => setIsReplaceDialogOpen(true)}>
                Importer une liste
              </Button>
            </Actions>
          </Toolbar>

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

const Toolbar = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 16px;
`

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  > .Field-TextInput {
    width: 260px;
  }

  > .Field-Select {
    width: 200px;
  }
`

const Actions = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 8px;
`

const TableLegend = styled.p`
  color: ${p => p.theme.color.slateGray};
  line-height: 1;
  margin-bottom: 4px;
`
