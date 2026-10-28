import { Accent, Button, Icon, IconButton, TextInput } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import {
  useAddAuthorizedOrganizationalUnitMutation,
  useDeleteAuthorizedOrganizationalUnitMutation,
  useGetAuthorizedOrganizationalUnitsQuery
} from '../../userManagementApi'

export function AuthorizedOrganizationalUnitList() {
  const { data: organizationalUnits = [] } = useGetAuthorizedOrganizationalUnitsQuery()
  const [addAuthorizedOrganizationalUnit] = useAddAuthorizedOrganizationalUnitMutation()
  const [deleteAuthorizedOrganizationalUnit] = useDeleteAuthorizedOrganizationalUnitMutation()

  const [nextOrganizationalUnit, setNextOrganizationalUnit] = useState<string | undefined>(undefined)

  const add = async () => {
    if (!nextOrganizationalUnit?.trim()) {
      return
    }

    await addAuthorizedOrganizationalUnit(nextOrganizationalUnit.trim())
    setNextOrganizationalUnit(undefined)
  }

  return (
    <Wrapper>
      <Description>
        Les agents connectés via Cerbère dont le service d’affectation dans l’annuaire du ministère (son « unité
        organisationnelle », ex : DAM/DPMA/CNSP) est l’un de ces services, ou l’un de leurs sous-services, peuvent se
        connecter sans être inscrits dans la liste des utilisateurs. Ainsi, DAM/DPMA autorise aussi DAM/DPMA/CNSP.
      </Description>

      <List data-cy="authorized-organizational-units">
        {organizationalUnits.map(organizationalUnit => (
          <Item key={organizationalUnit}>
            {organizationalUnit}
            <IconButton
              accent={Accent.TERTIARY}
              Icon={Icon.Delete}
              onClick={() => {
                void deleteAuthorizedOrganizationalUnit(organizationalUnit)
              }}
              title={`Supprimer le service autorisé ${organizationalUnit}`}
            />
          </Item>
        ))}
      </List>

      <AddForm>
        <TextInput
          isLabelHidden
          label="Service"
          name="organizationalUnit"
          onChange={setNextOrganizationalUnit}
          placeholder="ex : DAM/DIRM NAMO"
          value={nextOrganizationalUnit}
        />
        <Button
          accent={Accent.SECONDARY}
          disabled={!nextOrganizationalUnit?.trim()}
          onClick={() => {
            void add()
          }}
        >
          Ajouter
        </Button>
      </AddForm>
    </Wrapper>
  )
}

const Wrapper = styled.section``

const Description = styled.p`
  color: ${p => p.theme.color.slateGray};
  margin-bottom: 16px;
`

const List = styled.ul`
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
`

const Item = styled.li`
  align-items: center;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  width: 480px;
`

const AddForm = styled.div`
  display: flex;
  gap: 8px;

  > .Field-TextInput {
    width: 320px;
  }
`
