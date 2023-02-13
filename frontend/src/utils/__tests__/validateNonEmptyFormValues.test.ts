import { expect } from '@jest/globals'

import { FormError, FormErrorCode } from '../../libs/FormError'
import { validateNonEmptyFormValues } from '../validateNonEmptyFormValues'

describe('utils/validateNonEmptyFormValues()', () => {
  const requiredProps = ['requiredProp', 'requiredPropBis']

  it('should return a FormError when a required prop is missing', () => {
    const record = {
      requiredProp: [0],
      skippedProp: undefined
    }

    const [validRecord, formError] = validateNonEmptyFormValues<any>(requiredProps, record)

    expect(validRecord).toBeUndefined()
    expect(formError).toBeInstanceOf(FormError)
    expect(formError).toMatchObject({
      code: FormErrorCode.MISSING,
      key: 'requiredPropBis'
    })
  })

  it('should return a FormError when a required prop is null', () => {
    const record = {
      requiredProp: null,
      requiredPropBis: [0],
      skippedProp: undefined
    }

    const [validRecord, formError] = validateNonEmptyFormValues<any>(requiredProps, record)

    expect(validRecord).toBeUndefined()
    expect(formError).toBeInstanceOf(FormError)
    expect(formError).toMatchObject({
      code: FormErrorCode.UNDEFINED,
      key: 'requiredProp'
    })
  })

  it('should return a FormError when a required prop is undefined', () => {
    const record = {
      requiredProp: [0],
      requiredPropBis: undefined,
      skippedProp: undefined
    }

    const [validRecord, formError] = validateNonEmptyFormValues<any>(requiredProps, record)

    expect(validRecord).toBeUndefined()
    expect(formError).toBeInstanceOf(FormError)
    expect(formError).toMatchObject({
      code: FormErrorCode.UNDEFINED,
      key: 'requiredPropBis'
    })
  })

  it('should return a FormError when a required prop is not an array', () => {
    const record = {
      requiredProp: 0,
      requiredPropBis: [0],
      skippedProp: undefined
    }

    const [validRecord, formError] = validateNonEmptyFormValues<any>(requiredProps, record)

    expect(validRecord).toBeUndefined()
    expect(formError).toBeInstanceOf(FormError)
    expect(formError).toMatchObject({
      code: FormErrorCode.TYPE_ARRAY,
      key: 'requiredProp'
    })
  })

  it('should return a FormError when a required prop is empty', () => {
    const record = {
      requiredProp: [0],
      requiredPropBis: [],
      skippedProp: undefined
    }

    const [validRecord, formError] = validateNonEmptyFormValues<any>(requiredProps, record)

    expect(validRecord).toBeUndefined()
    expect(formError).toBeInstanceOf(FormError)
    expect(formError).toMatchObject({
      code: FormErrorCode.EMPTY_ARRAY,
      key: 'requiredPropBis'
    })
  })

  it('should return the original record when there has no error', () => {
    const record = {
      requiredProp: [0],
      requiredPropBis: [0],
      skippedProp: undefined
    }

    const [validRecord, formError] = validateNonEmptyFormValues<any>(requiredProps, record)

    expect(validRecord).toBe(record)
    expect(formError).toBeUndefined()
  })
})
