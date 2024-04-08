import { monitorfishApi } from '@api/api'
import {
  useCreateMissionActionMutation,
  useDeleteMissionActionMutation,
  useUpdateMissionActionMutation
} from '@api/missionAction'
import { useGetMissionCompletion } from '@features/Mission/components/MissionForm/hooks/useGetMissionCompletion'
import { CompletionStatusTag } from '@features/Mission/components/MissionForm/shared/CompletionStatusTag'
import { Mission } from '@features/Mission/mission.types'
import { autoSaveMission } from '@features/Mission/useCases/autoSaveMission'
import { autoSaveMissionAction } from '@features/Mission/useCases/autoSaveMissionAction'
import { deleteMission } from '@features/Mission/useCases/deleteMission'
import { deleteMissionAction } from '@features/Mission/useCases/deleteMissionAction'
import { saveMissionAndMissionActionsByDiff } from '@features/Mission/useCases/saveMissionAndMissionActionsByDiff'
import { cleanMissionForm } from '@features/SideWindow/useCases/cleanMissionForm'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import {
  Accent,
  Button,
  customDayjs,
  humanizePastDate,
  Icon,
  logSoftError,
  NotificationEvent
} from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { getMissionStatus } from 'domain/entities/mission/utils'
import { SideWindowMenuKey } from 'domain/entities/sideWindow/constants'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { FrontendErrorBoundary } from 'ui/FrontendErrorBoundary'
import { NoRsuiteOverrideWrapper } from 'ui/NoRsuiteOverrideWrapper'
import { useDebouncedCallback } from 'use-debounce'

import { ActionForm } from './ActionForm'
import { ActionList } from './ActionList'
import { getMissionActionFormInitialValues } from './ActionList/utils'
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
import { areMissionFormsValuesValid } from './utils/areMissionFormsValuesValid'
import { validateMissionForms } from './utils/validateMissionForms'
import {
  monitorenvMissionApi,
  useCreateMissionMutation,
  useDeleteMissionMutation,
  useUpdateMissionMutation
} from '../../monitorenvMissionApi'

import type { MissionActionFormValues, MissionMainFormValues } from './types'
import type { MissionWithActionsDraft } from '../../types'
import type { MissionAction } from '@features/Mission/missionAction.types'

const DEBOUNCE_DELAY = 500

export function MissionForm() {
  const dispatch = useMainAppDispatch()
  const missionIdFromPath = useMainAppSelector(store => store.sideWindow.selectedPath.id)
  const draft = useMainAppSelector(store => store.missionForm.draft)
  const hasEngagedControlUnit = useMainAppSelector(state => !!state.missionForm.engagedControlUnit)
  assertNotNullish(draft)

  const completion = useGetMissionCompletion()
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
    if (mainFormValues.endDateTimeUtc && now.isAfter(mainFormValues.endDateTimeUtc) && mainFormValues.isClosed) {
      return false
    }

    return true
  }, [mainFormValues])

  const isMissionFormValid = areMissionFormsValuesValid(mainFormValues, actionsFormValues)

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
    const isDeleted = dispatch(deleteMission(missionIdRef.current))
    if (!isDeleted) {
      setIsDeletionConfirmationDialogOpen(false)
    }
  }, [dispatch])

  const reopen = useCallback(() => {
    const nextMainFormValues = {
      ...mainFormValues,
      isClosed: false
    }
    setMainFormValues(nextMainFormValues)
    updateReduxSliceDraft()
    window.document.dispatchEvent(new NotificationEvent('La mission a bien été réouverte', 'success', true))

    if (!areMissionFormsValuesValid(nextMainFormValues, actionsFormValues)) {
      dispatch(missionFormActions.setIsDraftDirty(true))

      return
    }

    createOrUpdate({
      actionsFormValues,
      mainFormValues: nextMainFormValues
    })
  }, [dispatch, updateReduxSliceDraft, createOrUpdate, mainFormValues, actionsFormValues])

  const close = useCallback(async () => {
    const [canClose, { nextActionsFormValues, nextMainFormValues }] = validateMissionForms(
      mainFormValues,
      actionsFormValues,
      true
    )
    // Stop creation or update there in case there are closure validation error
    if (!canClose) {
      setMainFormValues(nextMainFormValues)
      setActionsFormValues(nextActionsFormValues)

      dispatch(missionFormActions.setIsDraftDirty(true))
      dispatch(missionFormActions.setIsClosing(true))

      return
    }

    const mainFormValuesWithIsClosed = {
      ...mainFormValues,
      isClosed: true
    }
    setMainFormValues(mainFormValuesWithIsClosed)
    updateReduxSliceDraft()

    await createOrUpdate({
      actionsFormValues,
      mainFormValues: mainFormValuesWithIsClosed
    })

    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.MISSION_LIST }))
  }, [dispatch, updateReduxSliceDraft, createOrUpdate, mainFormValues, actionsFormValues])

  const updateEditedActionFormValuesCallback = useCallback(
    async (nextActionFormValues: MissionActionFormValues) => {
      if (editedActionIndex === undefined) {
        return
      }

      const { id } = actionsFormValues.find((_, index) => index === editedActionIndex) ?? { id: undefined }
      const nextActionFormValuesWithId = { ...nextActionFormValues, id }

      const createdId = await dispatch(
        autoSaveMissionAction(
          nextActionFormValuesWithId,
          missionIdRef.current,
          mainFormValues.isClosed,
          isAutoSaveEnabled
        )
      )
      const nextActionsFormValuesWithCreatedId = actionsFormValues.map((action, index) =>
        index === editedActionIndex ? { ...nextActionFormValues, id: createdId } : action
      )
      setActionsFormValues(nextActionsFormValuesWithCreatedId)
      updateReduxSliceDraft()
    },
    [dispatch, updateReduxSliceDraft, editedActionIndex, actionsFormValues, mainFormValues.isClosed, isAutoSaveEnabled]
  )

  const updateEditedActionFormValues = useDebouncedCallback(
    (nextActionFormValues: MissionActionFormValues) => updateEditedActionFormValuesCallback(nextActionFormValues),
    DEBOUNCE_DELAY
  )

  const removeAction = useCallback(
    async (actionIndex: number) => {
      /**
       * If a debounce function is not yet executed, stop there to avoid race condition.
       * /!\ This can leads to save the debounced action update to the wrong action index
       */
      if (updateEditedActionFormValues.isPending()) {
        setTimeout(() => removeAction(actionIndex), DEBOUNCE_DELAY)

        return
      }

      const nextActionsFormValues = await dispatch(
        deleteMissionAction(
          actionsFormValues,
          actionIndex,
          isAutoSaveEnabled,
          mainFormValues.isGeometryComputedFromControls
        )
      )

      setActionsFormValues(nextActionsFormValues)
      updateReduxSliceDraft()
      if (editedActionIndex === actionIndex) {
        setEditedActionIndex(undefined)
      }
    },
    [
      dispatch,
      updateEditedActionFormValues,
      updateReduxSliceDraft,
      mainFormValues.isGeometryComputedFromControls,
      actionsFormValues,
      editedActionIndex,
      isAutoSaveEnabled
    ]
  )

  const addAction = useCallback(
    async (actionType: MissionAction.MissionActionType) => {
      /**
       * If a debounce function is not yet executed, stop there to avoid race condition.
       * /!\ This can leads to save the debounced action update to the wrong action index
       */
      if (updateEditedActionFormValues.isPending()) {
        setTimeout(() => addAction(actionType), DEBOUNCE_DELAY)

        return
      }

      const newActionFormValues = getMissionActionFormInitialValues(actionType)
      setEditedActionIndex(0)

      const createdId = await dispatch(
        autoSaveMissionAction(newActionFormValues, missionIdRef.current, mainFormValues.isClosed, isAutoSaveEnabled)
      )

      const nextActionsWithIdFormValues = [{ ...newActionFormValues, id: createdId }, ...actionsFormValues]
      setActionsFormValues(nextActionsWithIdFormValues)
      updateReduxSliceDraft()
    },
    [
      dispatch,
      updateEditedActionFormValues,
      updateReduxSliceDraft,
      actionsFormValues,
      mainFormValues.isClosed,
      isAutoSaveEnabled
    ]
  )

  const updateEditedActionIndex = useCallback(
    (nextActionIndex: number | undefined) => {
      /**
       * If a debounce function is not yet executed, stop there to avoid race condition.
       * /!\ This can leads to save the debounced action update to the wrong action index
       */
      if (updateEditedActionFormValues.isPending()) {
        setTimeout(() => updateEditedActionIndex(nextActionIndex), DEBOUNCE_DELAY)

        return
      }

      setEditedActionIndex(nextActionIndex)
    },
    [updateEditedActionFormValues]
  )

  const updateMainFormValuesCallback = useCallback(
    async (nextMissionMainFormValues: MissionMainFormValues) => {
      /**
       * If an action debounce function is not yet executed, stop there to avoid race condition.
       * /!\ This can leads to erase a changed action value
       */
      if (updateEditedActionFormValues.isPending()) {
        setTimeout(() => updateMainFormValuesCallback(nextMissionMainFormValues), DEBOUNCE_DELAY)

        return
      }

      const savedMainFormValues = await dispatch(
        autoSaveMission(nextMissionMainFormValues, mainFormValues, missionIdRef.current, isAutoSaveEnabled)
      )
      if (!savedMainFormValues) {
        return
      }

      setMainFormValues(savedMainFormValues)
      missionIdRef.current = savedMainFormValues.id
      updateReduxSliceDraft()
    },
    [dispatch, updateEditedActionFormValues, updateReduxSliceDraft, mainFormValues, isAutoSaveEnabled]
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
        isSideWindowError: true,
        message: '`canDeleteMission` API call failed.',
        originalError: error,
        userMessage: "Nous n'avons pas pu vérifier si cette mission est supprimable."
      })
    }
  }, [dispatch])

  useEffect(() => {
    if (!missionEvent) {
      return
    }

    setMainFormValues(previousMainFormValues => ({
      ...previousMainFormValues,
      isClosed: missionEvent.isClosed,
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
        <Header>
          <BackToListIcon onClick={goToMissionList} />

          <HeaderTitle>{title}</HeaderTitle>
          {mainFormValues && <MissionStatusTag status={getMissionStatus(mainFormValues)} />}
          <CompletionStatusTag completion={completion} />
        </Header>

        <Body>
          <FrontendErrorBoundary>
            <>
              <MainForm
                key={missionIdRef.current}
                initialValues={mainFormValues}
                missionId={missionIdRef.current}
                onChange={updateMainFormValues}
              />
              <ActionList
                actionsFormValues={actionsFormValues}
                currentIndex={editedActionIndex}
                missionId={missionIdRef.current}
                missionTypes={mainFormValues.missionTypes}
                onAdd={addAction}
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
            <AutoSaveTag isAutoSaveEnabled={isAutoSaveEnabled} />
            {!mainFormValues.isClosed && (
              <Button
                accent={Accent.SECONDARY}
                data-cy="close-mission"
                disabled={isSaving || !isMissionFormValid}
                onClick={close}
              >
                Clôturer
              </Button>
            )}
            {mainFormValues.isClosed && (
              <Button
                accent={Accent.SECONDARY}
                data-cy="reopen-mission"
                disabled={isSaving}
                Icon={Icon.Unlock}
                onClick={reopen}
                type="button"
              >
                Rouvrir la mission
              </Button>
            )}
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
        <DraftCancellationConfirmationDialog isAutoSaveEnabled={isAutoSaveEnabled} />
      )}
      {isExternalActionsDialogOpen && (
        <ExternalActionsDialog onClose={() => setIsExternalActionsDialogOpen(false)} sources={actionsSources} />
      )}
      {hasEngagedControlUnit && <DisabledMissionBackground />}
    </>
  )
}

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
  :not([disabled]) {
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
