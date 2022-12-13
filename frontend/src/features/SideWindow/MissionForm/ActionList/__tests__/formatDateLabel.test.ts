import { expect } from '@jest/globals'

import { dayjs } from '../../../../../utils/dayjs'
import { formatDateLabel } from '../utils'

describe('utils/formatDateLabel()', () => {
  it('should return the expected string in February', () => {
    const dateLabel = dayjs('1 Feb 2022 12:00:00 GMT').format('DD MMM')

    const result = formatDateLabel(dateLabel)

    expect(result).toStrictEqual('01 Févr')
  })

  it('should return the expected string in August', () => {
    const dateLabel = dayjs('8 Aug 2022 12:00:00 GMT').format('DD MMM')

    const result = formatDateLabel(dateLabel)

    expect(result).toStrictEqual('08 Août')
  })

  it('should return the expected string in December', () => {
    const dateLabel = dayjs('11 Dec 2022 12:00:00 GMT').format('DD MMM')

    const result = formatDateLabel(dateLabel)

    expect(result).toStrictEqual('11 Déc')
  })
})
