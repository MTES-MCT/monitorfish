import { ConfirmationModal } from '@components/ConfirmationModal'
import {
  CREATE_ALERT_ERROR_MESSAGE,
  DELETE_ALERT_ERROR_MESSAGE,
  UPDATE_ALERT_ERROR_MESSAGE,
  useCreateAlertMutation,
  useUpdateAlertMutation
} from '@features/Alert/apis'
import { Criteria } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/constants'
import { DistrictCriteria } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/Criteria/DistrictCriteria'
import { NationalityCriteria } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/Criteria/NationalityCriteria'
import { ProducerOrganizationCriteria } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/Criteria/ProducerOrganizationCriteria'
import { VesselCriteria } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/Criteria/VesselCriteria'
import { ZoneCriteria } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/Criteria/ZoneCriteria'
import { FormikValidityPeriod } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/FormikValidityPeriod'
import { FISHING_POSITION_ONLY_AS_OPTIONS } from '@features/Alert/components/SideWindowAlerts/constants'
import { alertActions } from '@features/Alert/components/SideWindowAlerts/slice'
import { EditedAlertSpecificationSchema } from '@features/Alert/schemas/EditedAlertSpecificationSchema'
import { deleteAlert } from '@features/Alert/useCases/deleteAlert'
import { FormHead } from '@features/Mission/components/MissionForm/shared/FormHead'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import {
  Accent,
  Button,
  customDayjs,
  Dropdown,
  FormikMultiRadio,
  FormikSelect,
  FormikTextarea,
  FormikTextInput,
  Icon,
  Level,
  THEME
} from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { toFormikValidationSchema } from '@utils/toFormikValidationSchema'
import { Form, Formik } from 'formik'
import { sortBy } from 'lodash-es'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import type { AlertSpecification } from '@features/Alert/types'

export function AlertManagementForm() {
  const dispatch = useMainAppDispatch()
  const [createAlert, { isLoading: isCreatingAlert }] = useCreateAlertMutation()
  const [updateAlert, { isLoading: isUpdatingAlert }] = useUpdateAlertMutation()
  const editedAlertSpecification = useMainAppSelector(state => state.alert.editedAlertSpecification)
  const infractions = useMainAppSelector(state => state.infraction.infractions)
  const [selectedCriterias, setSelectedCriterias] = useState<Criteria[]>([])
  const [isDraftCancellationConfirmationDialogOpen, setIsDraftCancellationConfirmationDialogOpen] = useState(false)
  const [isDeleteConfirmationDialogOpen, setIsDeleteConfirmationDialogOpen] = useState(false)
  assertNotNullish(editedAlertSpecification)

  const infractionsAsOptions = useMemo(
    () =>
      sortBy(
        infractions.map(infraction => ({
          label: `${infraction.natinfCode} - ${infraction.infraction}`,
          value: infraction.natinfCode
        })),
        ['label']
      ),
    [infractions]
  )

  const askForDraftCancellation = (isDirty: boolean) => {
    if (!isDirty) {
      dispatch(alertActions.setEditedAlertSpecification(undefined))

      return
    }

    setIsDraftCancellationConfirmationDialogOpen(true)
  }

  const handleConfirmCancelDraft = () => {
    setIsDraftCancellationConfirmationDialogOpen(false)
    dispatch(alertActions.setEditedAlertSpecification(undefined))
  }

  const onSave = async (nextEditedAlertSpecification: AlertSpecification) => {
    const isCreation = !nextEditedAlertSpecification.id

    try {
      const cleanedData = EditedAlertSpecificationSchema.strip().parse(nextEditedAlertSpecification)

      if (isCreation) {
        await createAlert(cleanedData).unwrap()
      } else {
        await updateAlert(cleanedData).unwrap()
      }

      dispatch(alertActions.setEditedAlertSpecification(undefined))
      dispatch(
        addSideWindowBanner({
          children: `L'alerte a bien été ${isCreation ? 'créée' : 'modifiée'}. Ses premières occurrences vont mettre quelques minutes à apparaître sur la carte`,
          closingDelay: 3000,
          isClosable: true,
          level: Level.SUCCESS,
          withAutomaticClosing: true
        })
      )
    } catch (e) {
      dispatch(
        addSideWindowBanner({
          children: isCreation ? CREATE_ALERT_ERROR_MESSAGE : UPDATE_ALERT_ERROR_MESSAGE,
          closingDelay: 5000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }

  const handleConfirmDelete = async () => {
    if (!editedAlertSpecification?.id) {
      return
    }

    try {
      dispatch(deleteAlert(editedAlertSpecification.id))
      dispatch(alertActions.setEditedAlertSpecification(undefined))
      setIsDeleteConfirmationDialogOpen(false)
      dispatch(
        addSideWindowBanner({
          children: `L'alerte a bien été supprimée. S'il y avait des occurrences en cours, elle mettront quelques minutes à disparaître de la carte.`,
          closingDelay: 3000,
          isClosable: true,
          level: Level.SUCCESS,
          withAutomaticClosing: true
        })
      )
    } catch (e) {
      dispatch(
        addSideWindowBanner({
          children: DELETE_ALERT_ERROR_MESSAGE,
          closingDelay: 5000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteConfirmationDialogOpen(false)
  }

  return (
    <>
      <Formik
        initialValues={editedAlertSpecification}
        onSubmit={onSave}
        validate={toFormikValidationSchema(EditedAlertSpecificationSchema)}
      >
        {({ dirty, values }) => {
          const hasZoneCriteria =
            !!values.regulatoryAreas.length ||
            !!values.administrativeAreas.length ||
            selectedCriterias.includes(Criteria.ZONE)
          const hasNationalityCriteria =
            !!values.flagStatesIso2.length || selectedCriterias.includes(Criteria.NATIONALITY)
          const hasVesselCriteria = !!values.vesselIds.length || selectedCriterias.includes(Criteria.VESSEL)
          const hasProducerOrganizationCriteria =
            !!values.producerOrganizations.length || selectedCriterias.includes(Criteria.PRODUCER_ORGANIZATION)
          const hasDistrictCriteria = !!values.districtCodes.length || selectedCriterias.includes(Criteria.DISTRICT)

          return (
            <Wrapper>
              <Header>
                <BackToListIcon
                  data-cy="go-back-alerts-management-list"
                  onClick={() => {
                    askForDraftCancellation(dirty)
                  }}
                />
                <HeaderTitle>{editedAlertSpecification?.id ? 'Modifier une alerte' : 'Nouvelle alerte'}</HeaderTitle>
              </Header>
              <Body>
                <Panel $isRight={false}>
                  <StyledFormHead>
                    <h2>Informations générales</h2>
                  </StyledFormHead>
                  <HeadDescription>
                    L’alerte concerne les navires émettant des positions VMS. Elle analyse l’activité sur 12h et
                    s’actualise toutes les 10 min.
                    <br />* Tous les champs marqués d’une astérisque rouge doivent être saisis.
                  </HeadDescription>
                  <FormikTextInput isRequired label="Nom" name="name" />
                  <FormikTextarea isRequired label="Description" name="description" />
                  <FormikSelect
                    isRequired
                    label="NATINF associé"
                    name="natinfCode"
                    options={infractionsAsOptions}
                    searchable
                  />
                  <StyledFormikMultiRadio
                    isInline
                    isRequired
                    label="Positions VMS prises en compte par l'alerte"
                    name="onlyFishingPositions"
                    options={FISHING_POSITION_ONLY_AS_OPTIONS}
                  />
                  <FormikValidityPeriod />
                </Panel>
                <Panel $isRight>
                  <StyledFormHead>
                    <h2>Critères de déclenchement</h2>
                    <StyledDropdown Icon={Icon.Plus} title="Ajouter un critère de déclenchement">
                      {!hasVesselCriteria && (
                        <Dropdown.Item
                          onClick={() => {
                            setSelectedCriterias(previous => previous.concat(Criteria.VESSEL))
                          }}
                        >
                          Navires
                        </Dropdown.Item>
                      )}
                      {!hasZoneCriteria && (
                        <Dropdown.Item
                          onClick={() => {
                            setSelectedCriterias(previous => previous.concat(Criteria.ZONE))
                          }}
                        >
                          Zones
                        </Dropdown.Item>
                      )}
                      {!hasNationalityCriteria && (
                        <Dropdown.Item
                          onClick={() => {
                            setSelectedCriterias(previous => previous.concat(Criteria.NATIONALITY))
                          }}
                        >
                          Nationalités
                        </Dropdown.Item>
                      )}
                      {!hasDistrictCriteria && (
                        <Dropdown.Item
                          onClick={() => {
                            setSelectedCriterias(previous => previous.concat(Criteria.DISTRICT))
                          }}
                        >
                          Départements et quartiers
                        </Dropdown.Item>
                      )}
                      {!hasProducerOrganizationCriteria && (
                        <Dropdown.Item
                          onClick={() => {
                            setSelectedCriterias(previous => previous.concat(Criteria.PRODUCER_ORGANIZATION))
                          }}
                        >
                          Organisations de producteurs
                        </Dropdown.Item>
                      )}
                    </StyledDropdown>
                  </StyledFormHead>
                  {hasVesselCriteria && (
                    <VesselCriteria
                      onDelete={() => {
                        setSelectedCriterias(previous => previous.filter(criteria => criteria !== Criteria.VESSEL))
                      }}
                      vessels={editedAlertSpecification.vessels}
                    />
                  )}
                  {hasZoneCriteria && (
                    <ZoneCriteria
                      onDelete={() => {
                        setSelectedCriterias(previous => previous.filter(criteria => criteria !== Criteria.ZONE))
                      }}
                    />
                  )}
                  {hasNationalityCriteria && (
                    <NationalityCriteria
                      onDelete={() => {
                        setSelectedCriterias(previous => previous.filter(criteria => criteria !== Criteria.NATIONALITY))
                      }}
                    />
                  )}
                  {hasProducerOrganizationCriteria && (
                    <ProducerOrganizationCriteria
                      onDelete={() => {
                        setSelectedCriterias(previous =>
                          previous.filter(criteria => criteria !== Criteria.PRODUCER_ORGANIZATION)
                        )
                      }}
                    />
                  )}
                  {hasDistrictCriteria && (
                    <DistrictCriteria
                      onDelete={() => {
                        setSelectedCriterias(previous => previous.filter(criteria => criteria !== Criteria.DISTRICT))
                      }}
                    />
                  )}
                </Panel>
              </Body>
              <Footer>
                {!!editedAlertSpecification.id && (
                  <DeleteButton
                    accent={Accent.SECONDARY}
                    Icon={Icon.Delete}
                    onClick={() => {
                      setIsDeleteConfirmationDialogOpen(true)
                    }}
                  >
                    Supprimer l’alerte
                  </DeleteButton>
                )}
                {!editedAlertSpecification.id && <Separator />}

                <AlertInfos>
                  {editedAlertSpecification.createdAtUtc && (
                    <>
                      Alerte créée par {editedAlertSpecification.createdBy} le{' '}
                      {customDayjs(editedAlertSpecification.createdAtUtc).utc().format('DD/MM/YYYY à HH[h]mm')}.{' '}
                    </>
                  )}
                  {!editedAlertSpecification.createdAtUtc && <>Alerte non enregistrée. </>}
                </AlertInfos>

                <RightButtonsContainer>
                  <Button
                    accent={Accent.SECONDARY}
                    disabled={false}
                    onClick={() => {
                      askForDraftCancellation(dirty)
                    }}
                  >
                    Fermer
                  </Button>
                  <Button disabled={isCreatingAlert || isUpdatingAlert} type="submit">
                    Enregistrer
                  </Button>
                </RightButtonsContainer>
              </Footer>
            </Wrapper>
          )
        }}
      </Formik>
      {isDraftCancellationConfirmationDialogOpen && (
        <ConfirmationModal
          cancelButtonLabel="Retourner à l’édition"
          color={THEME.color.maximumRed}
          confirmationButtonLabel="Quitter sans enregistrer"
          message={
            <>
              <p>Vous êtes en train d’abandonner l’édition de l’alerte.</p>
              <p>Voulez-vous enregistrer les modifications avant de quitter ?</p>
            </>
          }
          onCancel={() => setIsDraftCancellationConfirmationDialogOpen(false)}
          onConfirm={handleConfirmCancelDraft}
          title="Retour à la liste des alertes"
        />
      )}
      {isDeleteConfirmationDialogOpen && (
        <ConfirmationModal
          color={THEME.color.maximumRed}
          confirmationButtonLabel="Confirmer la suppression"
          iconName="Delete"
          message={
            <>
              <p>
                <b>Êtes-vous sûr de vouloir supprimer l&apos;alerte </b>
                <p>
                  <b>&quot;{editedAlertSpecification.name}&quot; ?</b>
                </p>
                <p>
                  Cela supprimera la définition et les critères de l&apos;alerte, ainsi que toutes les occurrences en
                  cours et futures.
                </p>
              </p>
            </>
          }
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Supprimer l'alerte"
        />
      )}
    </>
  )
}

export const Wrapper = styled(Form)`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

export const Header = styled.div`
  align-items: center;
  background-color: ${p => p.theme.color.white};
  box-shadow: 0 3px 4px #7077854d;
  z-index: 1;
  display: flex;
  max-height: 62px;
  min-height: 62px;
  padding: 0 32px 0 18px;

  > div {
    vertical-align: middle;
  }
`

const StyledFormHead = styled(FormHead)`
  margin: 24px 0 8px 0;
`
const StyledDropdown = styled(Dropdown)`
  > ul {
    width: 100%;
  }
`

export const Footer = styled.div`
  align-items: center;
  border-top: 1px solid ${p => p.theme.color.lightGray};
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 16px;
`

export const HeaderTitle = styled.h1`
  color: ${p => p.theme.color.charcoal};
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  margin: 0 0 4px !important;
  vertical-align: 2px;
`

export const BackToListIcon = styled(Icon.Chevron)`
  margin-right: 12px;
  transform: rotate(90deg);
  cursor: pointer;
`

const DeleteButton = styled(Button)`
  &:not([disabled]) {
    svg {
      color: ${p => p.theme.color.maximumRed};
    }
  }
`

const StyledFormikMultiRadio = styled(FormikMultiRadio)`
  margin-top: 8px;

  .Element-Field {
    margin-top: 8px !important;
  }
`

const Separator = styled.div``

const AlertInfos = styled.div`
  font-style: italic;
  color: ${p => p.theme.color.slateGray};
`

export const RightButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
`

const HeadDescription = styled.span`
  font-style: italic;
  color: ${p => p.theme.color.slateGray};
`

export const Body = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  min-height: 0;
`
const Panel = styled.div<{
  $isRight: boolean
}>`
  background-color: ${p => (p.$isRight ? p.theme.color.gainsboro : p.theme.color.white)};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-bottom: 24px;
  padding-right: 40px;
  padding-left: 40px;

  /* TODO Handle that in @mtes-mct/monitor-ui. */

  legend {
    font-weight: 400;
  }

  ${p =>
    !p.$isRight
      ? `
      .Element-Label,
      .Element-Legend {
        margin-top: 24px;
      }
      `
      : ''}
`
