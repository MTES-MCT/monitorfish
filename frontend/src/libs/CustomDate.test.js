import { CustomDate } from './CustomDate'

describe('libs/CustomDate', () => {
  it('should consider date input as UTC regardless of local timezone', () => {
    const date = new Date('2020-01-02T03:04:05.006')

    const result = new CustomDate(date)

    expect(result.date.toISOString()).toStrictEqual('2020-01-02T03:04:05.006Z')
  })

  describe('.fixOffset()', () => {
    it('should return a UTC date with an offset correction matching local tinezone', () => {
      const date = new Date('2020-01-02T03:04:05.006Z')

      const result = CustomDate.fixOffset(date)

      expect(result.toISOString()).toStrictEqual('2020-01-02T07:04:05.006Z')
    })
  })

  describe('.toEndOfDay()', () => {
    it('should return an end of day date', () => {
      const date = new Date(1656518765757)

      const result = new CustomDate(date).toEndOfDay()

      expect(result.toISOString()).toStrictEqual('2022-06-29T23:59:59.000Z')
    })
  })

  describe('.toStartOfDay()', () => {
    it('should return a start of day date', () => {
      const date = new Date(1656518765757)

      const result = new CustomDate(date).toStartOfDay()

      expect(result.toISOString()).toStrictEqual('2022-06-29T00:00:00.000Z')
    })
  })
})
