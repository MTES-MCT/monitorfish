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
import { autoSaveMission } from '@features/Mission/useCases/autoSaveMission'
import { autoSaveMissionAction } from '@features/Mission/useCases/autoSaveMissionAction'
import { deleteMission } from '@features/Mission/useCases/deleteMission'
import { deleteMissionAction } from '@features/Mission/useCases/deleteMissionAction'
import { saveMissionAndMissionActionsByDiff } from '@features/Mission/useCases/saveMissionAndMissionActionsByDiff'
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
import { useDebouncedCallback } from 'use-debounce'

import { ActionForm } from './ActionForm'
import { ActionList } from './ActionList'
import { getDuplicatedMissionActionFormValues, getMissionActionFormInitialValues } from './ActionList/utils'
import { AUTO_SAVE_ENABLED } from './constants'
import { useListenToMissionEventUpdatesById } from './hooks/useListenToMissionEventUpdatesById'
import { useUpdateFreezedActionFormValues } from './hooks/useUpdateFreezedActionFormValues'
import { MainForm } from './MainForm'
import { AutoSaveTag } from './shared/AutoSaveTag'
import { DeletionConfirmationDialog } from './shared/DeletionConfirmationDialog'
import { DraftCancellationConfirmationDialog } from './shared/DraftCancellationConfirmationDialog'
import { ExternalActionsDialog } from './shared/ExternalActionsDialog'
import { MissionStatusTag } from './shared/MissionStatusTag'
import { missionFormActions } from './slice'
import { getTitleFromMissionMainFormValues } from './utils'
import {
  monitorenvMissionApi,
  useCreateMissionMutation,
  useDeleteMissionMutation,
  useUpdateMissionMutation
} from '../../monitorenvMissionApi'

import type { MissionActionFormValues, MissionMainFormValues } from './types'
import type { MissionWithActionsDraft } from '../../types'

const DEBOUNCE_DELAY = 500

export function MissionForm() {
  const dispatch = useMainAppDispatch()
  const missionIdFromPath = useMainAppSelector(store => store.sideWindow.selectedPath.id)
  const draft = useMainAppSelector(store => store.missionForm.draft)
  const hasEngagedControlUnit = useMainAppSelector(state => !!state.missionForm.engagedControlUnit)
  const isMissionCreatedBannerDisplayed = useMainAppSelector(state => state.missionForm.isMissionCreatedBannerDisplayed)
  assertNotNullish(draft)

  const missionCompletion = useGetMissionFrontCompletion()
  const missionIdRef = useRef<number | undefined>(missionIdFromPath)

  const [, { isLoading: isCreatingMission }] = useCreateMissionMutation()
  const [, { isLoading: isDeletingMission }] = useDeleteMissionMutation()
  const [, { isLoading: isCreatingMissionAction }] = useCreateMissionActionMutation()
  const [, { isLoading: isDeletingMissionAction }] = useDeleteMissionActionMutation()
  const [, { isLoading: isUpdatingMission }] = useUpdateMissionMutation()
  const [, { isLoading: isUpdatingMissionAction }] = useUpdateMissionActionMutation()
  const missionEvent = useListenToMissionEventUpdatesById(missionIdRef.current)

  const isSaving =
    isCreatingMission ||
    isDeletingMission ||
    isUpdatingMission ||
    isCreatingMissionAction ||
    isDeletingMissionAction ||
    isUpdatingMissionAction

  const [mainFormValues, setMainFormValues] = useState<MissionMainFormValues>(draft.mainFormValues)
  const [actionsFormValues, setActionsFormValues] = useState<MissionActionFormValues[]>(draft.actionsFormValues)

  /**
   * Always holds the values last received from the main form, which are newer than `mainFormValues`
   * (only updated once a save resolves). `<MainForm />` is re-created whenever the mission id changes,
   * so reinitializing it from the values of the save instead of these would drop everything typed
   * while that save was in flight (see https://github.com/MTES-MCT/monitorfish/issues/5368).
   */
  const latestMainFormValuesRef = useRef<MissionMainFormValues>(draft.mainFormValues)

  /**
   * Always holds the latest actions, unlike the state captured by an async callback closure.
   * A debounced save resolving after its closure was created must never write back an outdated
   * list (it would drop the ids just created) nor read an outdated action id from it
   * (see https://github.com/MTES-MCT/monitorfish/issues/5368).
   */
  const actionsFormValuesRef = useRef<MissionActionFormValues[]>(draft.actionsFormValues)
  const updateActionsFormValues = useCallback(
    (updater: (previousActionsFormValues: MissionActionFormValues[]) => MissionActionFormValues[]) => {
      setActionsFormValues(previousActionsFormValues => {
        const nextActionsFormValues = updater(previousActionsFormValues)
        actionsFormValuesRef.current = nextActionsFormValues

        return nextActionsFormValues
      })
    },
    []
  )
  const [editedActionIndex, setEditedActionIndex] = useState<number | undefined>(undefined)
  const [isDeletionConfirmationDialogOpen, setIsDeletionConfirmationDialogOpen] = useState(false)
  const isDraftCancellationConfirmationDialogOpen = useMainAppSelector(
    store => store.sideWindow.isDraftCancellationConfirmationDialogOpen
  )
  const [isExternalActionsDialogOpen, setIsExternalActionsDialogOpen] = useState(false)
  const [actionsSources, setActionsSources] = useState<Mission.MissionSource[]>([])
  const [title, setTitle] = useState(getTitleFromMissionMainFormValues(mainFormValues, missionIdRef.current))

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

  const isAutoSaveEnabled = useMemo(() => {
    if (!AUTO_SAVE_ENABLED) {
      return false
    }

    const now = customDayjs()
    if (mainFormValues.endDateTimeUtc && now.subtract(48, 'hours').isAfter(mainFormValues.endDateTimeUtc)) {
      return false
    }

    return true
  }, [mainFormValues])

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

  const updateReduxSliceDraft = useDebouncedCallback(() => {
    dispatch(
      missionFormActions.setDraft({
        actionsFormValues: [...actionsFormValues],
        mainFormValues: { ...mainFormValues }
      })
    )

    setTitle(getTitleFromMissionMainFormValues(mainFormValues, missionIdRef.current))
  }, 250)

  /**
   * /!\ Only used when `isAutoSaveEnabled` is false
   */
  const createOrUpdate = useCallback(
    async (missionDraft: MissionWithActionsDraft) => {
      const savedMission = await dispatch(
        saveMissionAndMissionActionsByDiff(
          missionDraft.mainFormValues,
          missionDraft.actionsFormValues,
          missionIdRef.current
        )
      )

      setMainFormValues(savedMission)
      missionIdRef.current = savedMission.id
    },
    [dispatch, missionIdRef]
  )

  const goToMissionList = useCallback(async () => {
    const canExit = await dispatch(openSideWindowPath({ menu: SideWindowMenuKey.MISSION_LIST }))
    if (canExit) {
      dispatch(cleanMissionForm())
    }
  }, [dispatch])

  const handleDelete = useCallback(async () => {
    const isDeleted = await dispatch(deleteMission(missionIdRef.current))
    if (!isDeleted) {
      setIsDeletionConfirmationDialogOpen(false)
    }
  }, [dispatch])

  const updateEditedActionFormValuesCallback = useCallback(
    async (nextActionFormValues: MissionActionFormValues) => {
      if (editedActionIndex === undefined) {
        return
      }

      // Read the identity from the ref: a previous save may have set the id after this callback's closure was created
      const editedAction = actionsFormValuesRef.current[editedActionIndex]
      const nextActionFormValuesWithId = {
        ...nextActionFormValues,
        draftKey: nextActionFormValues.draftKey ?? editedAction?.draftKey,
        id: editedAction?.id
      }

      const createdId = await dispatch(
        autoSaveMissionAction(nextActionFormValuesWithId, missionIdRef.current, isAutoSaveEnabled)
      )
      updateActionsFormValues(previousActionsFormValues =>
        previousActionsFormValues.map((action, index) =>
          index === editedActionIndex
            ? { ...nextActionFormValues, draftKey: nextActionFormValuesWithId.draftKey, id: createdId }
            : action
        )
      )
      updateReduxSliceDraft()
    },
    [dispatch, updateActionsFormValues, updateReduxSliceDraft, editedActionIndex, isAutoSaveEnabled]
  )

  const updateEditedActionFormValues = useDebouncedCallback(
    (nextActionFormValues: MissionActionFormValues) => updateEditedActionFormValuesCallback(nextActionFormValues),
    DEBOUNCE_DELAY
  )

  /**
   * Immediately run a pending debounced action save (and wait for it), so the caller can go on with
   * an up-to-date, fully persisted list of actions.
   */
  const flushPendingActionSave = useCallback(async () => {
    if (!updateEditedActionFormValues.isPending()) {
      return
    }

    await updateEditedActionFormValues.flush()
  }, [updateEditedActionFormValues])

  const removeAction = useCallback(
    async (actionIndex: number) => {
      /**
       * Flush any pending action save before going on, to avoid a race condition.
       * /!\ Re-scheduling this callback instead would keep its (outdated) closure alive for as long
       * as the user keeps typing, and eventually save outdated values or re-create an action.
       */
      await flushPendingActionSave()

      const nextActionsFormValues = await dispatch(
        deleteMissionAction(
          actionsFormValuesRef.current,
          actionIndex,
          isAutoSaveEnabled,
          mainFormValues.isGeometryComputedFromControls
        )
      )

      updateActionsFormValues(() => nextActionsFormValues)
      updateReduxSliceDraft()
      if (editedActionIndex === actionIndex) {
        setEditedActionIndex(undefined)
      }
    },
    [
      dispatch,
      flushPendingActionSave,
      updateActionsFormValues,
      updateReduxSliceDraft,
      mainFormValues.isGeometryComputedFromControls,
      editedActionIndex,
      isAutoSaveEnabled
    ]
  )

  const addAction = useCallback(
    async (actionType: MissionAction.MissionActionType) => {
      // Flush any pending action save before going on, to avoid a race condition
      await flushPendingActionSave()

      const newActionFormValues = getMissionActionFormInitialValues(actionType)
      setEditedActionIndex(0)

      const createdId = await dispatch(
        autoSaveMissionAction(newActionFormValues, missionIdRef.current, isAutoSaveEnabled)
      )

      updateActionsFormValues(previousActionsFormValues => [
        { ...newActionFormValues, id: createdId },
        ...previousActionsFormValues
      ])
      updateReduxSliceDraft()
    },
    [dispatch, flushPendingActionSave, updateActionsFormValues, updateReduxSliceDraft, isAutoSaveEnabled]
  )

  const duplicateAction = useCallback(
    async (actionIndex: number) => {
      // Flush any pending action save before going on, to avoid a race condition
      await flushPendingActionSave()

      const actionToDuplicate = actionsFormValuesRef.current[actionIndex]
      if (!actionToDuplicate) {
        return
      }

      const actionCopy = getDuplicatedMissionActionFormValues(actionToDuplicate)
      setEditedActionIndex(0)

      const createdId = await dispatch(autoSaveMissionAction(actionCopy, missionIdRef.current, isAutoSaveEnabled))

      updateActionsFormValues(previousActionsFormValues => [
        { ...actionCopy, id: createdId },
        ...previousActionsFormValues
      ])
      updateReduxSliceDraft()
    },
    [dispatch, flushPendingActionSave, updateActionsFormValues, updateReduxSliceDraft, isAutoSaveEnabled]
  )

  const updateEditedActionIndex = useCallback(
    async (nextActionIndex: number | undefined) => {
      // Flush any pending action save before switching action, to avoid saving it to the wrong index
      await flushPendingActionSave()

      setEditedActionIndex(nextActionIndex)
    },
    [flushPendingActionSave]
  )

  const updateMainFormValuesCallback = useCallback(
    async (nextMissionMainFormValues: MissionMainFormValues) => {
      /**
       * Flush any pending action save before going on, to avoid a race condition.
       * /!\ Re-scheduling this callback instead would keep its (outdated) closure alive for as long
       * as the user keeps typing, and eventually overwrite the main form with outdated values.
       */
      await flushPendingActionSave()

      const haveMissionDatesChanged =
        mainFormValues.startDateTimeUtc !== nextMissionMainFormValues.startDateTimeUtc ||
        mainFormValues.endDateTimeUtc !== nextMissionMainFormValues.endDateTimeUtc

      const savedMainFormValues = await dispatch(
        autoSaveMission(nextMissionMainFormValues, mainFormValues, missionIdRef.current, isAutoSaveEnabled)
      )
      if (!savedMainFormValues) {
        return
      }

      setMainFormValues({
        ...latestMainFormValuesRef.current,
        createdAtUtc: savedMainFormValues.createdAtUtc,
        id: savedMainFormValues.id,
        updatedAtUtc: savedMainFormValues.updatedAtUtc
      })
      missionIdRef.current = savedMainFormValues.id
      updateReduxSliceDraft()

      /**
       * A control date must fall within the mission period, so changing the mission dates can make a
       * previously out-of-range action valid. An action is otherwise only auto-saved when its own form
       * changes, so we re-attempt saving the edited action here to persist a control that just became
       * valid (without this, the user has to re-edit the control date to trigger its save).
       */
      if (!haveMissionDatesChanged || editedActionIndex === undefined) {
        return
      }

      const editedActionFormValues = actionsFormValuesRef.current[editedActionIndex]
      if (!editedActionFormValues) {
        return
      }

      // Persist the draft synchronously so the action validation (which reads the mission dates from the
      // draft) sees the updated dates instead of the debounced, still-stale ones.
      dispatch(
        missionFormActions.setDraft({
          actionsFormValues: [...actionsFormValuesRef.current],
          mainFormValues: { ...savedMainFormValues }
        })
      )

      const savedActionId = await dispatch(
        autoSaveMissionAction(editedActionFormValues, missionIdRef.current, isAutoSaveEnabled)
      )
      if (savedActionId !== editedActionFormValues.id) {
        updateActionsFormValues(previousActionsFormValues =>
          previousActionsFormValues.map((action, index) =>
            index === editedActionIndex ? { ...editedActionFormValues, id: savedActionId } : action
          )
        )
        updateReduxSliceDraft()
      }
    },
    [
      dispatch,
      flushPendingActionSave,
      updateActionsFormValues,
      updateReduxSliceDraft,
      mainFormValues,
      isAutoSaveEnabled,
      editedActionIndex
    ]
  )

  const updateMainFormValues = useDebouncedCallback(
    (nextMissionMainFormValues: MissionMainFormValues) => updateMainFormValuesCallback(nextMissionMainFormValues),
    DEBOUNCE_DELAY
  )

  const toggleDeletionConfirmationDialog = useCallback(async () => {
    if (!missionIdRef.current) {
      return
    }

    try {
      const response = dispatch(monitorenvMissionApi.endpoints.canDeleteMission.initiate(missionIdRef.current))
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
  }, [dispatch])

  useEffect(() => {
    if (!missionEvent) {
      return
    }

    setMainFormValues(previousMainFormValues => ({
      ...previousMainFormValues,
      updatedAtUtc: missionEvent.updatedAtUtc
    }))
  }, [missionEvent])

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
                key={missionIdRef.current}
                initialValues={mainFormValues}
                missionId={missionIdRef.current}
                onChange={nextMainFormValues => {
                  latestMainFormValuesRef.current = nextMainFormValues
                  updateMainFormValues(nextMainFormValues)
                }}
              />
              <ActionList
                actionsFormValues={actionsFormValues}
                currentIndex={editedActionIndex}
                missionId={missionIdRef.current}
                missionTypes={mainFormValues.missionTypes}
                onAdd={addAction}
                onDuplicate={duplicateAction}
                onRemove={removeAction}
                onSelect={updateEditedActionIndex}
              />
              <ActionForm
                // We use this key to fully control when to re-render `<ActionForm />`
                key={`action-form-${actionFormKey}`}
                actionFormValues={formikEditedActionFormValuesRef.current}
                onChange={updateEditedActionFormValues}
              />
            </>
          </FrontendErrorBoundary>
        </Body>
        <Footer>
          {missionIdRef.current && (
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
                  await createOrUpdate({
                    actionsFormValues,
                    mainFormValues
                  })

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
        <DraftCancellationConfirmationDialog isAutoSaveEnabled={isAutoSaveEnabled} isNew={!missionIdRef.current} />
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
