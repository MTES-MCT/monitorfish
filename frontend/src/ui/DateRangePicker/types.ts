export type DateOrTimeInputRef = {
  boxSpan: HTMLSpanElement
  /**
   * Focus the first input in the group.
   *
   * @param inLastInputOfTheGroup - If `true`, focus the last input in the group instead of the first one
   */
  focus: (inLastInputOfTheGroup?: boolean) => void
}

export enum DateRangePosition {
  END = 'END',
  START = 'START',
}

/** In the shape of [year, month, day]. */
export type DateTuple = [number, number, number]

export type DateTupleRange = [DateTuple, DateTuple]

/** In the shape of [hour, minute]. */
export type TimeTuple = [number, number]
