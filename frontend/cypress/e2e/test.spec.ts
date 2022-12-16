/// <reference types="cypress" />

context('Test', () => {
  beforeEach(() => {
    cy.visit('/test')
  })

  it('Should fill and clear the text input', () => {
    cy.fill('Text input', 'A text input value')

    cy.get('pre').contains(
      JSON.stringify({
        textInput: 'A text input value'
      })
    )

    cy.fill('Text input', undefined)

    cy.get('pre').contains(JSON.stringify({}))
  })

  it('Should fill the text input with a hidden label', () => {
    cy.fill('Text input with hidden label', 'A text input with hidden label value')

    cy.get('pre').contains(
      JSON.stringify({
        textInputWithHiddenLabel: 'A text input with hidden label value'
      })
    )
  })

  it('Should fill and clear the textarea', () => {
    cy.fill('Textarea', 'A textarea value')

    cy.get('pre').contains(
      JSON.stringify({
        textarea: 'A textarea value'
      })
    )

    cy.fill('Textarea', undefined)

    cy.get('pre').contains(JSON.stringify({}))
  })

  it('Should fill the textarea with a hidden label', () => {
    cy.fill('Textarea with hidden label', 'A textarea with hidden label value')

    cy.get('pre').contains(
      JSON.stringify({
        textareaWithHiddenLabel: 'A textarea with hidden label value'
      })
    )
  })

  it('Should check and uncheck the checkbox', () => {
    cy.fill('Checkbox', true)

    cy.get('pre').contains(
      JSON.stringify({
        checkbox: true
      })
    )

    cy.fill('Checkbox', false)

    cy.get('pre').contains(
      JSON.stringify({
        checkbox: false
      })
    )
  })

  it('Should select the 2nd option in the select, and clear it', () => {
    cy.fill('Select', 'Second select option')

    cy.get('pre').contains(
      JSON.stringify({
        select: 'SECOND_SELECT_OPTION'
      })
    )

    cy.fill('Select', undefined)

    cy.get('pre').contains(JSON.stringify({}))
  })

  it('Should select the 42th option in the select with a search input', () => {
    cy.fill('Select with search input', 'Select with search input option 42')

    cy.get('pre').contains(
      JSON.stringify({
        selectWithSearchInput: 'SELECT_WITH_SEARCH_INPUT_OPTION_42'
      })
    )
  })

  it('Should select the 2nd option in the select with a hidden label', () => {
    cy.fill('Select with hidden label', 'Second select with hidden label option')

    cy.get('pre').contains(
      JSON.stringify({
        selectWithHiddenLabel: 'SECOND_SELECT_WITH_HIDDEN_LABEL_OPTION'
      })
    )
  })

  it('Should select the 2nd and 3rd option in the multi select, and clear them', () => {
    cy.fill('Multi select', ['Second multi select option', 'Third multi select option'])

    cy.get('pre').contains(
      JSON.stringify({
        multiSelect: ['SECOND_MULTI_SELECT_OPTION', 'THIRD_MULTI_SELECT_OPTION']
      })
    )

    cy.fill('Multi select', undefined)

    cy.get('pre').contains(JSON.stringify({}))
  })

  // it('Should select the 21st and 42th option in the multi select with a search input', () => {
  //   cy.fill('Multi select with search input', [
  //     'Multi select with search input option 21',
  //     'Multi select with search input option 42'
  //   ])

  //   cy.get('pre').contains(
  //     JSON.stringify({
  //       multiSelectWithSearchInput: [
  //         'MULTI_SELECT_WITH_SEARCH_INPUT_OPTION_21',
  //         'MULTI_SELECT_WITH_SEARCH_INPUT_OPTION_42'
  //       ]
  //     })
  //   )
  // })

  it('Should select the 2nd and 3rd option in the multi select with a hidden label', () => {
    cy.fill('Multi select with hidden label', [
      'Second multi select with hidden label option',
      'Third multi select with hidden label option'
    ])

    cy.get('pre').contains(
      JSON.stringify({
        multiSelectWithHiddenLabel: [
          'SECOND_MULTI_SELECT_WITH_HIDDEN_LABEL_OPTION',
          'THIRD_MULTI_SELECT_WITH_HIDDEN_LABEL_OPTION'
        ]
      })
    )
  })

  it('Should check the 2nd and 3rd option in the multi checkbox, and clear them', () => {
    cy.fill('Multi checkbox', ['Second multi checkbox option', 'Third multi checkbox option'])

    cy.get('pre').contains(
      JSON.stringify({
        multiCheckbox: ['SECOND_MULTI_CHECKBOX_OPTION', 'THIRD_MULTI_CHECKBOX_OPTION']
      })
    )

    cy.fill('Multi checkbox', undefined)

    cy.get('pre').contains(JSON.stringify({}))
  })

  it('Should check the 2nd and 3rd option in the multi checkbox with a hidden label', () => {
    cy.fill('Multi checkbox with hidden label', [
      'Second multi checkbox with hidden label option',
      'Third multi checkbox with hidden label option'
    ])

    cy.get('pre').contains(
      JSON.stringify({
        multiCheckboxWithHiddenLabel: [
          'SECOND_MULTI_CHECKBOX_WITH_HIDDEN_LABEL_OPTION',
          'THIRD_MULTI_CHECKBOX_WITH_HIDDEN_LABEL_OPTION'
        ]
      })
    )
  })

  it('Should check the 2nd option in the multi radio, and clear them', () => {
    cy.fill('Multi radio', 'Second multi radio option')

    cy.get('pre').contains(
      JSON.stringify({
        multiRadio: 'SECOND_MULTI_RADIO_OPTION'
      })
    )
  })

  it('Should check the 2nd option in the multi radio with a hidden label', () => {
    cy.fill('Multi radio with hidden label', 'Second multi radio with hidden label option')

    cy.get('pre').contains(
      JSON.stringify({
        multiRadioWithHiddenLabel: 'SECOND_MULTI_RADIO_WITH_HIDDEN_LABEL_OPTION'
      })
    )
  })
})
