import { expect } from '@jest/globals'

import { FormError, FormErrorCode } from '../../libs/FormError'
import { validateRequiredFormValues } from '../validateRequiredFormValues'

describe('utils/validateRequiredFormValues()', () => {
  const requiredProps = ['requiredProp', 'requiredPropBis']

  it('should return a FormError when a required prop is missing', () => {
    const record = {
      requiredProp: 1,
      skippedProp: undefined
    }

    const [validRecord, formError] = validateRequiredFormValues<any>(requiredProps, record)

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
      requiredPropBis: 0,
      skippedProp: undefined
    }

    const [validRecord, formError] = validateRequiredFormValues<any>(requiredProps, record)

    expect(validRecord).toBeUndefined()
    expect(formError).toBeInstanceOf(FormError)
    expect(formError).toMatchObject({
      code: FormErrorCode.UNDEFINED,
      key: 'requiredProp'
    })
  })

  it('should return a FormError when a required prop is undefined', () => {
    const record = {
      requiredProp: 0,
      requiredPropBis: undefined,
      skippedProp: undefined
    }

    const [validRecord, formError] = validateRequiredFormValues<any>(requiredProps, record)

    expect(validRecord).toBeUndefined()
    expect(formError).toBeInstanceOf(FormError)
    expect(formError).toMatchObject({
      code: FormErrorCode.UNDEFINED,
      key: 'requiredPropBis'
    })
  })

  it('should return the original record when there has no error', () => {
    const record = {
      requiredProp: 1,
      requiredPropBis: 2,
      requiredPropTer: 3,
      skippedProp: undefined
    }

    const [validRecord, formError] = validateRequiredFormValues<any>(requiredProps, record)

    expect(validRecord).toBe(record)
    expect(formError).toBeUndefined()
  })
})
