import { monitorfishApi } from '@api/api'
import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { useGetMissionFrontCompletion } from '@features/Mission/components/MissionForm/hooks/useGetMissionFrontCompletion'
import { MainFormLiveSchema } from '@features/Mission/components/MissionForm/MainForm/schemas'
import { CompletionStatusTag } from '@features/Mission/components/MissionForm/shared/CompletionStatusTag'
import { isMissionActionFormValid } from '@features/Mission/components/MissionForm/utils/isMissionActionFormValid'
import { Mission } from '@features/Mission/mission.types'
import { MissionAction } from '@features/Mission/missionAction.types'
import {
  useCreateMissionActionMutation,
  useDeleteMissionActionMutation,
  useUpdateMissionActionMutation
} from '@features/Mission/missionActionApi'
import { deleteMission } from '@features/Mission/useCases/deleteMission'
import { getMissionStatus } from '@features/Mission/utils'
import { SideWindowMenuKey } from '@features/SideWindow/constants'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { cleanMissionForm } from '@features/SideWindow/useCases/cleanMissionForm'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Banner, Button, customDayjs, humanizePastDate, Icon, Level, THEME } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { logSoftError } from '@utils/logSoftError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { NoRsuiteOverrideWrapper } from 'ui/NoRsuiteOverrideWrapper'

import { ActionForm } from './ActionForm'
import { ActionList } from './ActionList'
import { useMissionFormAutoSave } from './hooks/useMissionFormAutoSave'
import { useUpdateFreezedActionFormValues } from './hooks/useUpdateFreezedActionFormValues'
import { MainForm } from './MainForm'
import { AutoSaveTag } from './shared/AutoSaveTag'
import { DeletionConfirmationDialog } from './shared/DeletionConfirmationDialog'
import { DraftCancellationConfirmationDialog } from './shared/DraftCancellationConfirmationDialog'
import { ExternalActionsDialog } from './shared/ExternalActionsDialog'
import { MissionStatusTag } from './shared/MissionStatusTag'
import { missionFormActions } from './slice'
import {
  monitorenvMissionApi,
  useCreateMissionMutation,
  useDeleteMissionMutation,
  useUpdateMissionMutation
} from '../../monitorenvMissionApi'

import type { MissionActionFormValues } from './types'

function useIsMissionSaving(): boolean {
  const [, { isLoading: isCreatingMission }] = useCreateMissionMutation()
  const [, { isLoading: isDeletingMission }] = useDeleteMissionMutation()
  const [, { isLoading: isUpdatingMission }] = useUpdateMissionMutation()
  const [, { isLoading: isCreatingMissionAction }] = useCreateMissionActionMutation()
  const [, { isLoading: isDeletingMissionAction }] = useDeleteMissionActionMutation()
  const [, { isLoading: isUpdatingMissionAction }] = useUpdateMissionActionMutation()

  return (
    isCreatingMission ||
    isDeletingMission ||
    isUpdatingMission ||
    isCreatingMissionAction ||
    isDeletingMissionAction ||
    isUpdatingMissionAction
  )
}

export function MissionForm() {
  const dispatch = useMainAppDispatch()
  const missionIdFromPath = useMainAppSelector(store => store.sideWindow.selectedPath.id)
  const draft = useMainAppSelector(store => store.missionForm.draft)
  const hasEngagedControlUnit = useMainAppSelector(state => !!state.missionForm.engagedControlUnit)
  const isMissionCreatedBannerDisplayed = useMainAppSelector(state => state.missionForm.isMissionCreatedBannerDisplayed)
  const isDraftCancellationConfirmationDialogOpen = useMainAppSelector(
    store => store.sideWindow.isDraftCancellationConfirmationDialogOpen
  )
  assertNotNullish(draft)

  const {
    actionsFormValues,
    addAction,
    duplicateAction,
    editedActionIndex,
    isAutoSaveEnabled,
    mainFormInitialValues,
    mainFormValues,
    missionId,
    removeAction,
    saveEditedAction,
    saveMainForm,
    saveWholeMission,
    selectAction,
    title
  } = useMissionFormAutoSave(draft, missionIdFromPath)

  const missionCompletion = useGetMissionFrontCompletion()
  const isSaving = useIsMissionSaving()

  const [isDeletionConfirmationDialogOpen, setIsDeletionConfirmationDialogOpen] = useState(false)
  const [isExternalActionsDialogOpen, setIsExternalActionsDialogOpen] = useState(false)
  const [actionsSources, setActionsSources] = useState<Mission.MissionSource[]>([])

  // We use these keys to fully control when to re-render `<ActionForm />`
  // since they are fully memoized in order to optimize their (heavy) re-rendering
  const [actionFormKey, setActionFormKey] = useState(0)

  // `formikEditedActionFormValuesRef` is freezed as Formik manage his state internally
  const formikEditedActionFormValuesRef = useRef<MissionActionFormValues | undefined>(undefined)
  useUpdateFreezedActionFormValues(
    formikEditedActionFormValuesRef.current,
    actionsFormValues,
    editedActionIndex,
    nextActionFormValues => {
      formikEditedActionFormValuesRef.current = nextActionFormValues
      setActionFormKey(key => key + 1)
    }
  )

  const isMissionFormValid = useMemo(() => {
    const isMainFormValid = MainFormLiveSchema.isValidSync(mainFormValues)
    const areAllActionsValid = actionsFormValues.every(actionFormValues =>
      isMissionActionFormValid(actionFormValues, false, dispatch)
    )

    return isMainFormValid && areAllActionsValid
  }, [mainFormValues, actionsFormValues, dispatch])

  const formattedUpdateDate = useMemo(
    () => mainFormValues.updatedAtUtc && humanizePastDate(mainFormValues.updatedAtUtc),
    [mainFormValues.updatedAtUtc]
  )

  const goToMissionList = useCallback(async () => {
    const canExit = await dispatch(openSideWindowPath({ menu: SideWindowMenuKey.MISSION_LIST }))
    if (canExit) {
      dispatch(cleanMissionForm())
    }
  }, [dispatch])

  const handleDelete = useCallback(async () => {
    const isDeleted = await dispatch(deleteMission(missionId))
    if (!isDeleted) {
      setIsDeletionConfirmationDialogOpen(false)
    }
  }, [dispatch, missionId])

  const toggleDeletionConfirmationDialog = useCallback(async () => {
    if (!missionId) {
      return
    }

    try {
      const response = dispatch(monitorenvMissionApi.endpoints.canDeleteMission.initiate(missionId))
      const canDeleteMissionResponse = await response.unwrap()
      if (canDeleteMissionResponse.canDelete) {
        setIsDeletionConfirmationDialogOpen(true)

        return
      }

      setActionsSources(canDeleteMissionResponse.sources)
      setIsExternalActionsDialogOpen(true)
    } catch (error) {
      logSoftError({
        callback: () =>
          dispatch(
            addSideWindowBanner({
              children: "Nous n'avons pas pu vérifier si cette mission est supprimable.",
              closingDelay: 6000,
              isClosable: true,
              level: Level.ERROR,
              withAutomaticClosing: true
            })
          ),
        message: '`canDeleteMission` API call failed.',
        originalError: error
      })
    }
  }, [dispatch, missionId])

  useEffect(() => {
    dispatch(missionFormActions.setIsListeningToEvents(true))

    return () => {
      dispatch(missionFormActions.setIsListeningToEvents(false))
      dispatch(monitorfishApi.util.invalidateTags(['Missions']))
    }
  }, [dispatch])

  return (
    <>
      <Wrapper>
        {isMissionCreatedBannerDisplayed && (
          <StyledBanner
            closingDelay={10000}
            isClosable
            isCollapsible={false}
            isHiddenByDefault={false}
            level={Level.SUCCESS}
            top="62"
            withAutomaticClosing
          >
            <MissionCreatedText>
              <Icon.Confirm color={THEME.color.mediumSeaGreen} />
              La mission a bien été créée
            </MissionCreatedText>
          </StyledBanner>
        )}
        {missionCompletion === MissionAction.FrontCompletionStatus.TO_COMPLETE_MISSION_ENDED && (
          <StyledBanner
            closingDelay={5000}
            isClosable={false}
            isCollapsible
            isHiddenByDefault={false}
            level={Level.ERROR}
            top="62"
            withAutomaticClosing
          >
            <MissionEndedText>
              <Icon.AttentionFilled color={THEME.color.maximumRed} />
              Veuillez compléter ou corriger les éléments en rouge
            </MissionEndedText>
          </StyledBanner>
        )}
        <Header data-cy="mission-form-header">
          <BackToListIcon onClick={goToMissionList} />

          <HeaderTitle>{title}</HeaderTitle>
          {mainFormValues && <MissionStatusTag status={getMissionStatus(mainFormValues)} />}
          <CompletionStatusTag completion={missionCompletion} />
        </Header>

        <Body>
          <FrontendErrorBoundary>
            <>
              <MainForm
                key={missionId}
                initialValues={mainFormInitialValues}
                missionId={missionId}
                onChange={saveMainForm}
              />
              <ActionList
                actionsFormValues={actionsFormValues}
                currentIndex={editedActionIndex}
                missionId={missionId}
                missionTypes={mainFormValues.missionTypes}
                onAdd={addAction}
                onDuplicate={duplicateAction}
                onRemove={removeAction}
                onSelect={selectAction}
              />
              <ActionForm
                // We use this key to fully control when to re-render `<ActionForm />`
                key={`action-form-${actionFormKey}`}
                actionFormValues={formikEditedActionFormValuesRef.current}
                onChange={saveEditedAction}
              />
            </>
          </FrontendErrorBoundary>
        </Body>
        <Footer>
          {missionId && (
            <DeleteButton
              accent={Accent.SECONDARY}
              disabled={isSaving || mainFormValues.missionSource !== Mission.MissionSource.MONITORFISH}
              Icon={Icon.Delete}
              onClick={toggleDeletionConfirmationDialog}
            >
              Supprimer la mission
            </DeleteButton>
          )}

          <Separator />

          <MissionInfos>
            {mainFormValues.createdAtUtc && mainFormValues.missionSource && (
              <>
                Mission créée par le {Mission.MissionSourceLabel[mainFormValues.missionSource]} le{' '}
                {customDayjs(mainFormValues.createdAtUtc).utc().format('DD/MM/YYYY à HH[h]mm')}.{' '}
              </>
            )}
            {!mainFormValues.createdAtUtc && <>Mission non enregistrée. </>}
            {mainFormValues.updatedAtUtc && <>Dernière modification enregistrée {formattedUpdateDate}.</>}
          </MissionInfos>

          <RightButtonsContainer>
            <StyledAutoSaveTag isAutoSaveEnabled={isAutoSaveEnabled} />
            <Button
              accent={isAutoSaveEnabled ? Accent.PRIMARY : Accent.SECONDARY}
              disabled={isSaving}
              onClick={goToMissionList}
            >
              Fermer
            </Button>

            {!isAutoSaveEnabled && (
              <Button
                accent={Accent.PRIMARY}
                disabled={isSaving || !isMissionFormValid}
                onClick={async () => {
                  await saveWholeMission()

                  goToMissionList()
                }}
              >
                Enregistrer
              </Button>
            )}
          </RightButtonsContainer>
        </Footer>
      </Wrapper>

      {isDeletionConfirmationDialogOpen && (
        <DeletionConfirmationDialog
          onCancel={() => setIsDeletionConfirmationDialogOpen(false)}
          onConfirm={handleDelete}
        />
      )}
      {isDraftCancellationConfirmationDialogOpen && (
        <DraftCancellationConfirmationDialog isAutoSaveEnabled={isAutoSaveEnabled} isNew={!missionId} />
      )}
      {isExternalActionsDialogOpen && (
        <ExternalActionsDialog onClose={() => setIsExternalActionsDialogOpen(false)} sources={actionsSources} />
      )}
      {hasEngagedControlUnit && <DisabledMissionBackground />}
    </>
  )
}

const StyledAutoSaveTag = styled(AutoSaveTag)`
  margin-left: 24px;
`

const StyledBanner = styled(Banner)`
  left: unset;
  width: calc(100% - 64px);
  min-width: calc(100% - 64px);
`

const MissionCreatedText = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: center;
`

const MissionEndedText = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: center;
`

const DisabledMissionBackground = styled.div`
  position: absolute;
  background-color: ${p => p.theme.color.white};
  opacity: 0.6;
  width: 100%;
  height: 100%;
  z-index: 5;
`

export const BackToListIcon = styled(Icon.Chevron)`
  margin-right: 12px;
  transform: rotate(90deg);
  cursor: pointer;
`

// All containers within Wrapper should now be only using flexboxes
export const Wrapper = styled(NoRsuiteOverrideWrapper)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

export const Header = styled.div`
  align-items: center;
  background-color: ${p => p.theme.color.white};
  box-shadow: 0px 3px 4px #7077854d;
  z-index: 1;
  display: flex;
  max-height: 62px;
  min-height: 62px;
  padding: 0 32px 0 18px;

  > div {
    vertical-align: middle;
  }

  .Element-Tag {
    align-self: auto !important;
    margin-left: 8px;
  }

  .Element-Tag:nth-of-type(1) {
    margin-left: 33px;
  }
`

export const HeaderTitle = styled.h1`
  color: ${p => p.theme.color.charcoal};
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  margin: 0 0 4px !important;
  vertical-align: 2px;
`

export const Body = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-grow: 1;
  min-height: 0;
`

export const Footer = styled.div`
  align-items: center;
  border-top: 1px solid ${p => p.theme.color.lightGray};
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 16px;
`

const DeleteButton = styled(Button)`
  &:not([disabled]) {
    svg {
      color: ${p => p.theme.color.maximumRed};
    }
  }
`

const Separator = styled.div``

const MissionInfos = styled.div`
  font-style: italic;
  color: ${p => p.theme.color.slateGray};
`

export const RightButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
`
