import { beforeEach, describe, expect, it } from '@jest/globals'

import {
  findFirstMissingFieldElement,
  findMissingFieldElement,
  scrollToFirstMissingField
} from '../scrollToFirstMissingField'

describe('findMissingFieldElement()', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-missing-field-anchor="vesselId" id="vessel"></div>
      <div data-missing-field-anchor="latitude longitude" id="location"></div>
      <input name="emitsVms" id="emitsVms" />
      <table><tbody><tr data-cy="species-onboard-row-1" id="species-row"></tr></tbody></table>
      <fieldset data-missing-field-anchor="infractions" id="infractions"></fieldset>
    `
  })

  it('Should find the field input by its name', () => {
    expect(findMissingFieldElement(document, 'emitsVms')?.id).toEqual('emitsVms')
  })

  it('Should fall back to the table row of a row field', () => {
    expect(findMissingFieldElement(document, 'speciesOnboard[1].faoZones')?.id).toEqual('species-row')
  })

  it('Should fall back to the section anchor', () => {
    expect(findMissingFieldElement(document, 'longitude')?.id).toEqual('location')
    expect(findMissingFieldElement(document, 'infractions[0].infractionType')?.id).toEqual('infractions')
  })

  it('Should return null when nothing matches', () => {
    expect(findMissingFieldElement(document, 'completedBy')).toBeNull()
  })
})

describe('findFirstMissingFieldElement()', () => {
  it('Should return the element displayed first, whatever the paths order', () => {
    document.body.innerHTML = `
      <div data-missing-field-anchor="vesselId" id="vessel"></div>
      <input name="emitsVms" id="emitsVms" />
    `

    expect(findFirstMissingFieldElement(document, ['completedBy', 'emitsVms', 'vesselId'])?.id).toEqual('vessel')
  })
})

describe('scrollToFirstMissingField()', () => {
  it('Should only look for and scroll within the action form panel', () => {
    document.body.innerHTML = `
      <div id="main-form"><input name="completedBy" /></div>
      <div data-action-form-scroll-container id="action-form">
        <p id="header"></p>
        <input name="completedBy" id="action-completed-by" />
      </div>
    `
    const scrollContainer = document.getElementById('action-form') as HTMLElement
    const containerScrollTo = jest.fn()
    scrollContainer.scrollTo = containerScrollTo
    const actionCompletedBy = document.getElementById('action-completed-by') as HTMLElement
    actionCompletedBy.getBoundingClientRect = () => ({ height: 40, top: 900 }) as DOMRect
    scrollContainer.getBoundingClientRect = () => ({ height: 600, top: 100 }) as DOMRect

    scrollToFirstMissingField(document.getElementById('header') as HTMLElement, ['completedBy'])

    expect(containerScrollTo).toHaveBeenCalledWith({ behavior: 'smooth', top: 520 })
  })
})
