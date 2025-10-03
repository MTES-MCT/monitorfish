import { VALIDITY_PERIOD_AS_OPTIONS } from '@features/Alert/components/SideWindowAlerts/constants'
import { DateRangePicker, FormikCheckbox, Icon, MultiRadio, THEME, useNewWindow } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import styled from 'styled-components'

import type { EditedAlertSpecification } from '@features/Alert/types'
import type { DateAsStringRange } from '@mtes-mct/monitor-ui/types/definitions'

export function FormikValidityPeriod() {
  const { newWindowContainerRef } = useNewWindow()
  const { setFieldValue, values } = useFormikContext<EditedAlertSpecification>()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [selectedPeriodType, setSelectedPeriodType] = useState<'ALL_TIME' | 'PERIOD'>(
    !values.validityStartDatetimeUtc && !values.validityEndDatetimeUtc ? 'ALL_TIME' : 'PERIOD'
  )

  const dateRangeDefaultValue =
    !!values.validityStartDatetimeUtc && !!values.validityEndDatetimeUtc
      ? ([values.validityStartDatetimeUtc, values.validityEndDatetimeUtc] as DateAsStringRange)
      : undefined

  const customOptions = VALIDITY_PERIOD_AS_OPTIONS

  useEffect(() => {
    // Hacky solution to add info icon to "Sur une période donnée" option
    const addIconToLabel = () => {
      if (!wrapperRef.current) {
        return
      }

      const periodLabels = wrapperRef.current.querySelectorAll('label')
      periodLabels.forEach(label => {
        if (label.textContent?.includes('Sur une période donnée') && !label.querySelector('.info-icon')) {
          const iconSpan = document.createElement('span')
          iconSpan.title =
            "Hors de la période de validité définie, l'alerte ne remontera aucune occurrence mais ne sera pas désactivée ou supprimée."
          iconSpan.style.marginLeft = '8px'
          iconSpan.style.verticalAlign = 'middle'
          iconSpan.style.display = 'inline-flex'
          iconSpan.style.alignItems = 'center'

          const root = createRoot(iconSpan)
          root.render(<Icon.Info color={THEME.color.slateGray} size={16} />)

          label.appendChild(iconSpan)
        }
      })
    }

    setTimeout(addIconToLabel, 200)
  }, [])

  const handleDateRangePickerChange = (dateRange: DateAsStringRange | undefined) => {
    if (!dateRange) {
      return
    }

    setFieldValue('validityStartDatetimeUtc', dateRange[0])
    setFieldValue('validityEndDatetimeUtc', dateRange[1])
  }

  const handleValidityPeriodChange = (nextValue: 'ALL_TIME' | 'PERIOD' | undefined) => {
    if (!nextValue) {
      return
    }

    setSelectedPeriodType(nextValue)

    if (nextValue === 'ALL_TIME') {
      setFieldValue('validityStartDatetimeUtc', undefined)
      setFieldValue('validityEndDatetimeUtc', undefined)
      setFieldValue('repeatEachYear', false)

      return
    }

    setFieldValue('validityStartDatetimeUtc', undefined)
    setFieldValue('validityEndDatetimeUtc', undefined)
  }

  return (
    <Wrapper ref={wrapperRef}>
      <StyledMultiRadio
        isInline
        isRequired
        label="Période de validité"
        name="validityPeriod"
        onChange={nextValue => handleValidityPeriodChange(nextValue as 'ALL_TIME' | 'PERIOD')}
        options={customOptions}
        value={selectedPeriodType}
      />
      {selectedPeriodType === 'PERIOD' && (
        <>
          <StyledDateRangePicker
            baseContainer={newWindowContainerRef.current}
            defaultValue={dateRangeDefaultValue}
            isLabelHidden
            isStringDate
            label="Plage de temps sur mesure"
            name="dateRange"
            onChange={handleDateRangePickerChange}
            withFullDayDefaults
          />
          <StyledFormikCheckbox label="Récurrence annuelle" name="repeatEachYear" />
        </>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin-bottom: 32px;
`

const StyledMultiRadio = styled(MultiRadio)`
  margin-top: 8px;
  margin-bottom: 22px;

  .Element-Field {
    margin-top: 8px !important;
  }
`

const StyledFormikCheckbox = styled(FormikCheckbox)`
  margin-top: 16px;
`

const StyledDateRangePicker = styled(DateRangePicker)`
  .rs-picker-popup {
    top: -310px !important;
  }
`
