import { COUNTRIES_AS_ALPHA2_OPTIONS } from '@constants/index'
import { HIDDEN_ERROR } from '@features/Mission/components/MissionForm/constants'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { VesselSearch } from '@features/Vessel/components/VesselSearch'
import { UNKNOWN_VESSEL } from '@features/Vessel/types/vessel'
import { showVessel } from '@features/Vessel/useCases/showVessel'
import { useGetVesselQuery } from '@features/Vessel/vesselApi'
import { isPriorityGroup } from '@features/VesselGroup/utils/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Checkbox, FormikSelect, FormikTextInput, Icon, Tag, THEME, useNewWindow } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

import { useGetMissionActionFormikUsecases } from '../../hooks/useGetMissionActionFormikUsecases'

import type { MissionActionFormValues } from '../../types'
import type { AISVessel } from '@features/Vessel/AISVessel.types'
import type { Vessel } from '@features/Vessel/Vessel.types'

export function VesselField() {
  const { errors, setValues, values } = useFormikContext<MissionActionFormValues>()
  const { updateFieldsControlledByVessel } = useGetMissionActionFormikUsecases()
  const dispatch = useMainAppDispatch()

  const { newWindowContainerRef } = useNewWindow()

  const { data: vessel, isFetching } = useGetVesselQuery(values.vesselId ?? skipToken)

  const defaultValue = (function () {
    if (!values.vesselId || !values.flagState) {
      return undefined
    }

    if (values.vesselId === UNKNOWN_VESSEL.vesselId) {
      return undefined
    }

    return {
      beaconNumber: undefined,
      districtCode: values.districtCode,
      externalReferenceNumber: values.externalReferenceNumber,
      flagState: values.flagState ?? UNKNOWN_VESSEL.flagState,
      internalReferenceNumber: values.internalReferenceNumber,
      ircs: values.ircs,
      mmsi: undefined,
      vesselId: values.vesselId,
      vesselIdentifier: undefined,
      vesselLength: undefined,
      vesselName: values.vesselName
    }
  })()

  const handleVesselSearchChange = (
    nextVessel: Vessel.VesselIdentity | AISVessel.AISVessel | undefined,
    isAIS?: boolean
  ) => {
    if (isAIS) {
      return
    }
    const identity = nextVessel as Partial<Vessel.VesselIdentity> | undefined
    if (!identity) {
      setValues({
        ...values,
        districtCode: undefined,
        externalReferenceNumber: undefined,
        flagState: undefined,
        internalReferenceNumber: undefined,
        ircs: undefined,
        vesselId: undefined,
        vesselName: undefined
      })

      return
    }

    // TODO Show an error in this case?
    if (!identity.vesselId) {
      return
    }

    setValues({
      ...values,
      districtCode: identity.districtCode,
      externalReferenceNumber: identity.externalReferenceNumber,
      flagState: identity.flagState,
      internalReferenceNumber: identity.internalReferenceNumber,
      ircs: identity.ircs,
      vesselId: identity.vesselId,
      vesselName: identity.vesselName
    })

    const valuesWithVessel = {
      ...values,
      internalReferenceNumber: identity.internalReferenceNumber ?? undefined,
      vesselId: identity.vesselId ?? undefined
    }
    updateFieldsControlledByVessel(valuesWithVessel)
  }

  const handleIsVesselUnknownChange = (isChecked: boolean | undefined) => {
    if (isChecked) {
      handleVesselSearchChange(UNKNOWN_VESSEL)

      return
    }

    handleVesselSearchChange(undefined)
  }

  const handleVesselLinkClick = (displayedVessel: Vessel.VesselIdentity) => {
    dispatch(showVessel(displayedVessel, false))
  }

  const sortedGroups = [...(vessel?.groups ?? [])].sort(
    (groupA, groupB) => Number(isPriorityGroup(groupB)) - Number(isPriorityGroup(groupA))
  )
  const tripReportings = vessel?.tripReportings ?? []
  const hasTags = !isFetching && (sortedGroups.length > 0 || tripReportings.length > 0)

  return (
    <>
      <Wrapper>
        <Field>
          <StyledVesselSearch
            baseRef={newWindowContainerRef}
            disabled={values.vesselId === UNKNOWN_VESSEL.vesselId}
            displayedErrorKey={DisplayedErrorKey.MISSION_FORM_ERROR}
            hasError={!!errors.vesselId}
            isVesselIdRequiredFromResults
            onChange={handleVesselSearchChange}
            onVesselLinkClick={handleVesselLinkClick}
            shouldCloseOnClickOutside
            value={defaultValue}
            withLastSearchResults
          />
          <Checkbox
            checked={values.vesselId === UNKNOWN_VESSEL.vesselId}
            label="Navire inconnu"
            name="isVesselUnknown"
            onChange={handleIsVesselUnknownChange}
          />
        </Field>
        {values.vesselId === UNKNOWN_VESSEL.vesselId && (
          <Columns>
            <FormikTextInput isErrorMessageHidden isLight label="Nom du navire" name="vesselName" />
            <FormikSelect
              isLight
              label="Nationalité"
              name="flagState"
              options={COUNTRIES_AS_ALPHA2_OPTIONS}
              searchable
              virtualized
            />
          </Columns>
        )}
        {values.vesselId && values.vesselId !== UNKNOWN_VESSEL.vesselId && (
          <VesselIdentityBar>
            {values.internalReferenceNumber && (
              <>
                <span>{values.internalReferenceNumber}</span> (CFR)
              </>
            )}
            {values.externalReferenceNumber && (
              <>
                <span>{values.externalReferenceNumber}</span> (Mq. ext)
              </>
            )}
            {values.ircs && (
              <>
                <span>{values.ircs}</span> (Call Sign)
              </>
            )}
            {!isFetching && !!vessel?.vesselLength && (
              <>
                <span>{vessel.vesselLength}m</span> (Taille)
              </>
            )}
          </VesselIdentityBar>
        )}
        {values.vesselId && values.vesselId !== UNKNOWN_VESSEL.vesselId && hasTags && (
          <TagsBar data-cy="mission-action-vessel-tags">
            {sortedGroups.map(group => (
              <StyledTag
                key={`group-${group.id}`}
                backgroundColor={THEME.color.gainsboro}
                color={THEME.color.gunMetal}
                Icon={isPriorityGroup(group) ? Icon.Priority : Icon.CircleFilled}
                iconColor={group.color}
                title={isPriorityGroup(group) ? 'Groupe prioritaire du navire' : 'Groupe du navire'}
              >
                {group.name}
              </StyledTag>
            ))}
            {tripReportings.map(reporting => (
              <StyledTag
                key={`reporting-${reporting.id}`}
                backgroundColor={THEME.color.gainsboro}
                color={THEME.color.gunMetal}
                Icon={Icon.Alert}
                iconColor={THEME.color.maximumRed}
                title="Suspicion d'infraction en cours sur la marée"
              >
                {reporting.type === ReportingType.ALERT ? reporting.value.name : reporting.value.title}
              </StyledTag>
            ))}
          </TagsBar>
        )}
      </Wrapper>

      {errors.vesselId && errors.vesselId !== HIDDEN_ERROR && <ErrorMessage>{errors.vesselId}</ErrorMessage>}
    </>
  )
}

const Columns = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 8px;

  > div {
    flex: 1 1 0;
  }
`

const ErrorMessage = styled.p`
  color: ${p => p.theme.color.maximumRed};
  font-style: italic;
  margin: 4px 0 0 !important;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const Field = styled.div`
  align-items: center;
  display: flex;

  > div:first-child {
    flex-grow: 1;
    margin-right: 16px;
  }

  /* TODO Change that in monitor-ui */
  > div:last-child {
    label {
      white-space: nowrap;
    }
  }
`

const StyledVesselSearch = styled(VesselSearch)`
  width: 400px;

  > div {
    z-index: 10;
  }
`

const VesselIdentityBar = styled.div`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  margin-top: 4px;

  > span {
    font-weight: normal;

    &:not(:first-child) {
      margin-left: 16px;
    }
  }
`

const TagsBar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`

const StyledTag = styled(Tag)`
  cursor: default;
`
