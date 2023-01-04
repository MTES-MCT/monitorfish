import {
  FormikCheckbox,
  FormikEffect,
  FormikMultiCheckbox,
  FormikMultiRadio,
  FormikMultiSelect,
  FormikSelect,
  FormikTextarea,
  FormikTextInput
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'

export function TestPage() {
  const [output, setOutput] = useState({})

  return (
    <Formik initialValues={{}} onSubmit={noop}>
      <>
        <CustomGlobalStyle />
        <FormikEffect onChange={setOutput} />

        <h1>Test Page</h1>

        <Wrapper>
          <FormikTextInput label="Text input" name="textInput" />
          <hr />
          <FormikTextInput isLabelHidden label="Text input with hidden label" name="textInputWithHiddenLabel" />

          <hr />
          <FormikTextarea label="Textarea" name="textarea" />
          <hr />
          <FormikTextarea isLabelHidden label="Textarea with hidden label" name="textareaWithHiddenLabel" />

          <hr />
          <FormikCheckbox label="Checkbox" name="checkbox" />

          <hr />
          <FormikSelect
            label="Select"
            name="select"
            options={[
              { label: 'First select option', value: 'FIRST_SELECT_OPTION' },
              { label: 'Second select option', value: 'SECOND_SELECT_OPTION' },
              { label: 'Third select option', value: 'THIRD_SELECT_OPTION' }
            ]}
          />
          <hr />
          <FormikSelect
            label="Select with search input"
            name="selectWithSearchInput"
            options={new Array(50).fill(undefined).map((_, index) => ({
              label: `Select with search input option ${String(index + 1).padStart(2, '0')}`,
              value: `SELECT_WITH_SEARCH_INPUT_OPTION_${String(index + 1).padStart(2, '0')}`
            }))}
            searchable
          />
          <hr />
          <FormikSelect
            isLabelHidden
            label="Select with hidden label"
            name="selectWithHiddenLabel"
            options={[
              { label: 'First select with hidden label option', value: 'FIRST_SELECT_WITH_HIDDEN_LABEL_OPTION' },
              { label: 'Second select with hidden label option', value: 'SECOND_SELECT_WITH_HIDDEN_LABEL_OPTION' },
              { label: 'Third select with hidden label option', value: 'THIRD_SELECT_WITH_HIDDEN_LABEL_OPTION' }
            ]}
          />

          <hr />
          <FormikMultiSelect
            fixedWidth={160}
            label="Multi select"
            name="multiSelect"
            options={[
              { label: 'First multi select option', value: 'FIRST_MULTI_SELECT_OPTION' },
              { label: 'Second multi select option', value: 'SECOND_MULTI_SELECT_OPTION' },
              { label: 'Third multi select option', value: 'THIRD_MULTI_SELECT_OPTION' }
            ]}
          />
          <hr />
          {/* TODO Add a Cypress helper with a related test for this component. */}
          <FormikMultiSelect
            fixedWidth={160}
            label="Multi select with search input"
            name="multiSelectWithSearchInput"
            options={new Array(50).fill(undefined).map((_, index) => ({
              label: `Multi select with search input option ${String(index + 1).padStart(2, '0')}`,
              value: `MULTI_SELECT_WITH_SEARCH_INPUT_OPTION_${String(index + 1).padStart(2, '0')}`
            }))}
            searchable
          />
          <hr />
          <FormikMultiSelect
            fixedWidth={160}
            isLabelHidden
            label="Multi select with hidden label"
            name="multiSelectWithHiddenLabel"
            options={[
              {
                label: 'First multi select with hidden label option',
                value: 'FIRST_MULTI_SELECT_WITH_HIDDEN_LABEL_OPTION'
              },
              {
                label: 'Second multi select with hidden label option',
                value: 'SECOND_MULTI_SELECT_WITH_HIDDEN_LABEL_OPTION'
              },
              {
                label: 'Third multi select with hidden label option',
                value: 'THIRD_MULTI_SELECT_WITH_HIDDEN_LABEL_OPTION'
              }
            ]}
          />

          <hr />
          <FormikMultiCheckbox
            isInline
            label="Multi checkbox"
            name="multiCheckbox"
            options={[
              { label: 'First multi checkbox option', value: 'FIRST_MULTI_CHECKBOX_OPTION' },
              { label: 'Second multi checkbox option', value: 'SECOND_MULTI_CHECKBOX_OPTION' },
              { label: 'Third multi checkbox option', value: 'THIRD_MULTI_CHECKBOX_OPTION' }
            ]}
          />
          <hr />
          <FormikMultiCheckbox
            isInline
            isLabelHidden
            label="Multi checkbox with hidden label"
            name="multiCheckboxWithHiddenLabel"
            options={[
              {
                label: 'First multi checkbox with hidden label option',
                value: 'FIRST_MULTI_CHECKBOX_WITH_HIDDEN_LABEL_OPTION'
              },
              {
                label: 'Second multi checkbox with hidden label option',
                value: 'SECOND_MULTI_CHECKBOX_WITH_HIDDEN_LABEL_OPTION'
              },
              {
                label: 'Third multi checkbox with hidden label option',
                value: 'THIRD_MULTI_CHECKBOX_WITH_HIDDEN_LABEL_OPTION'
              }
            ]}
          />

          <hr />
          <FormikMultiRadio
            isInline
            label="Multi radio"
            name="multiRadio"
            options={[
              { label: 'First multi radio option', value: 'FIRST_MULTI_RADIO_OPTION' },
              { label: 'Second multi radio option', value: 'SECOND_MULTI_RADIO_OPTION' },
              { label: 'Third multi radio option', value: 'THIRD_MULTI_RADIO_OPTION' }
            ]}
          />
          <hr />
          <FormikMultiRadio
            isInline
            isLabelHidden
            label="Multi radio with hidden label"
            name="multiRadioWithHiddenLabel"
            options={[
              {
                label: 'First multi radio with hidden label option',
                value: 'FIRST_MULTI_RADIO_WITH_HIDDEN_LABEL_OPTION'
              },
              {
                label: 'Second multi radio with hidden label option',
                value: 'SECOND_MULTI_RADIO_WITH_HIDDEN_LABEL_OPTION'
              },
              {
                label: 'Third multi radio with hidden label option',
                value: 'THIRD_MULTI_RADIO_WITH_HIDDEN_LABEL_OPTION'
              }
            ]}
          />
        </Wrapper>

        <pre>{JSON.stringify(output)}</pre>
      </>
    </Formik>
  )
}

const CustomGlobalStyle = createGlobalStyle`
  html {
    overflow-y: auto;
  }
`

const Wrapper = styled.div`
  padding: 1rem;

  hr {
    background: black;
    margin: 1rem 0;
  }
`
